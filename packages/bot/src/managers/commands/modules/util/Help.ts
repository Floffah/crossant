import { stripIndents } from "common-tags";
import {
    APIApplicationCommandOption,
    APIApplicationCommandSubCommandOptions,
} from "discord-api-types/payloads/v9/_interactions/slashCommands";
import { ManagerNames } from "src/managers/commands/managers";
import { CommandName } from "src/managers/commands/structures/BaseCommand";
import { ApplicationCommandOptionType } from "src/util/djs/enums";
import { defaultEmbed } from "src/util/embeds";
import { optionsToUsage } from "src/util/options";
import IncomingSlashCommand from "../../structures/IncomingSlashCommand";
import SlashCommand from "../../structures/SlashCommand";

export default class HelpCommand extends SlashCommand {
    constructor() {
        super("help", "Show the help menu", (s) =>
            s.addStringOption((opt) =>
                opt
                    .setName("command")
                    .setRequired(false)
                    .setDescription(
                        "Command to show information about. For sub commands, do command.subcommand",
                    ),
            ),
        );
    }

    async incoming(i: IncomingSlashCommand) {
        if (!i.hasGuild || !i.guild) throw "Must have guild";

        const cache = this.module.managers.get(ManagerNames.CacheManager);
        if (!cache) throw "No cache manager";
        const cmds = this.module.managers.get(ManagerNames.CommandsManager);
        if (!cmds) throw "No command manager";

        const prefix = await cache.getOrFetchGuildPrefix(i.guild);

        if (i.options.get("command")) {
            const commandopt = i.options.getString("command", true);
            const command = commandopt.toLowerCase().split(".")[0];
            const groups = commandopt.toLowerCase().split(".");
            groups.shift();
            const cmd = (
                cmds.aliases.has(command)
                    ? cmds.commands.get(
                          cmds.aliases.get(command) as CommandName,
                      )
                    : cmds.commands.get(`slash@${command}`)
            ) as SlashCommand | undefined;

            if (!cmd) throw `No such command ${command}`;

            let options: APIApplicationCommandOption[] | undefined =
                cmd.options?.map((t) => t.toJSON());
            let lastGroup: string | undefined;

            for (const g of groups) {
                if (!options || (lastGroup !== undefined && lastGroup !== g))
                    throw `No such group ${g}`;

                for (const opt of options) {
                    if (
                        opt.name === g &&
                        (opt.type === ApplicationCommandOptionType.Subcommand ||
                            opt.type ===
                                ApplicationCommandOptionType.SubcommandGroup)
                    ) {
                        options = (
                            opt as APIApplicationCommandSubCommandOptions
                        ).options;
                        lastGroup = opt.name;
                    }
                }
            }

            if (!options) options = cmd.options?.map((o) => o.toJSON()) ?? [];

            await i.reply({
                embeds: [
                    defaultEmbed()
                        .setTitle(
                            `"${cmd.name}${
                                groups.length > 0 ? groups.join(" ") : ""
                            }" Help`,
                        )
                        .setDescription(cmd.baseopts.description)
                        .addField(
                            "Usage",
                            optionsToUsage(cmd.name, options, "/", groups),
                        ),
                ],
            });
        } else {
            const embed = defaultEmbed().setTitle("Help")
                .setDescription(stripIndents`
                Each of the following commands can be ran using \`${prefix}command\` or through Discord's slash commands. Press \`/\` for more help with slash comands.
                
                Tip: If you need multiple words for a single argument (in a message command, not a slash command), wrap it in "quotes" (or if it is the last argument in the command, it is always treated as multi-worded!)
                `);

            for (const module of cmds.modules.values()) {
                const commands: string[] = [];

                for (const cmd of module.commands) {
                    const cmnd = (await cmds.commands.get(`slash@${cmd}`)) as
                        | SlashCommand
                        | undefined;

                    if (
                        cmnd &&
                        cmnd.options &&
                        cmnd.options.length > 0 &&
                        (
                            [
                                ApplicationCommandOptionType.Subcommand,
                                ApplicationCommandOptionType.SubcommandGroup,
                            ] as number[]
                        ).includes(cmnd.options[0].toJSON().type)
                    ) {
                        for (const opt of cmnd.options) {
                            commands.push(`${cmd} ${opt.toJSON().name}`);
                        }
                    } else commands.push(cmd);
                }

                embed.addField(
                    module.name.replace(/(?:^|\s)\S/g, (s) => s.toUpperCase()),
                    `\`${commands.join("`, `")}\``,
                );
            }

            await i.reply({
                embeds: [embed],
            });
        }
    }
}
