import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { GuildChannel } from "discord.js";
import SlashCommand from "src/managers/commands/structures/SlashCommand";
import { Setups, SetupTypes } from "src/settings/setup";
import { defaultEmbed } from "src/util/messages/embeds";
import IncomingSlashCommand from "../../structures/IncomingSlashCommand";

export default class SetupCommand extends SlashCommand {
    constructor() {
        super(
            "setup",
            "Setup advanced features in your server that are more complicated than a config value",
            (s) => {
                s.addSubcommand((c) =>
                    c
                        .setName("info")
                        .setDescription(
                            "Get info about a specific setup command",
                        )
                        .addStringOption((o) =>
                            o
                                .setName("name")
                                .setDescription(
                                    "Name of the setup you want to get info on",
                                )
                                .setRequired(true)
                                .addChoices(
                                    Object.keys(Setups).map((k) => [k, k]),
                                ),
                        ),
                );

                for (const k of Object.keys(
                    Setups,
                ) as (keyof typeof Setups)[]) {
                    s.addSubcommand((c) =>
                        (
                            Setups[k].options ??
                            ((c: SlashCommandSubcommandBuilder) => c)
                        )(
                            c
                                .setName(k.toLowerCase())
                                .setDescription(Setups[k].description),
                        ),
                    );
                }

                return s;
            },
            {
                deferred: true,
                ephemeral: true,
            },
        );
    }

    async incoming(i: IncomingSlashCommand) {
        if (!i.member || !i.guild) throw "Must be ran in a guild";
        if (!(i.channel instanceof GuildChannel) || !i.channel.isText())
            throw "Must be ran in a text channel";
        const sub = i.options.getSubcommand(true);

        if (sub === "info") {
            await this.infoCommand(i);
        } else {
            const setupname = Object.keys(Setups).find(
                (v) => v.toLowerCase() === sub,
            );
            const setup = Setups[setupname as SetupTypes];
            if (!setup) throw "Setup does not exist";
            if (!i.member.permissions.has(setup.permission))
                throw "No permission";

            // @ts-ignore
            await setup.run(i);
        }
    }

    async infoCommand(i: IncomingSlashCommand) {
        const name = i.options.getString("name", true);

        const setup = Setups[name as SetupTypes];
        if (!setup) throw `${name} is not a valid setup`;

        await i.editReply({
            embeds: [
                defaultEmbed()
                    .setTitle(name)
                    .setDescription(
                        `${setup.description}\n\nPermission: ${setup.permission
                            .toLowerCase()
                            .replace("_", " ")}`,
                    ),
            ],
        });
    }
}
