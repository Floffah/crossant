import { SettingType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { APIMessage } from "discord-api-types/v9";
import {
    GuildChannel,
    Message,
    MessageActionRow,
    MessageButton,
} from "discord.js";
import { ManagerNames } from "src/managers/commands/managers";
import IncomingSlashCommand from "src/managers/commands/structures/IncomingSlashCommand";
import SlashCommand from "src/managers/commands/structures/SlashCommand";
import { defaultEmbed } from "src/util/embeds";
import { carefulSplit } from "src/util/sanitize";
import {
    guildSettingNames,
    guildSettings,
    settingParsers,
} from "src/util/settings";
import { ValueOf } from "src/util/types";

export default class ConfigCommand extends SlashCommand {
    constructor() {
        super("config", "Configure the bot for your server", (s) => {
            s.addSubcommand((c) =>
                c
                    .setName("list")
                    .setDescription(
                        "Lists all possible config entries and information about them",
                    ),
            )
                .addSubcommand((c) =>
                    c
                        .setName("info")
                        .setDescription(
                            "Get information about a single config entry (and the value value this server has)",
                        )
                        .addStringOption((o) =>
                            o
                                .setName("entry")
                                .setDescription("Name of the config entry")
                                .setRequired(true)
                                .addChoices(
                                    Object.keys(guildSettings).map((s) => [
                                        s,
                                        s,
                                    ]),
                                ),
                        ),
                )
                .addSubcommand((c) =>
                    c
                        .setName("set")
                        .setDescription("Set a config entry")
                        .addStringOption((o) =>
                            o
                                .setName("entry")
                                .setDescription("Name of the config entry")
                                .setRequired(true)
                                .addChoices(
                                    Object.keys(guildSettings).map((s) => [
                                        s,
                                        s,
                                    ]),
                                ),
                        )
                        .addStringOption((o) =>
                            o
                                .setName("string")
                                .setDescription("Value as a string"),
                        )
                        .addBooleanOption((o) =>
                            o
                                .setName("boolean")
                                .setDescription("Value as a boolean"),
                        )
                        .addIntegerOption((o) =>
                            o
                                .setName("number")
                                .setDescription("Value as a number"),
                        )
                        .addChannelOption((o) =>
                            o
                                .setName("channel")
                                .setDescription("Value as a channel"),
                        )
                        .addUserOption((o) =>
                            o.setName("user").setDescription("Value as a user"),
                        )
                        .addRoleOption((o) =>
                            o.setName("role").setDescription("Value as a role"),
                        ),
                )
                .addSubcommand((c) =>
                    c
                        .setName("help")
                        .setDescription(
                            "Show a full help menu with all information about using configs",
                        ),
                );

            return s;
        });
    }

    async incoming(i: IncomingSlashCommand) {
        const sub = i.options.getSubcommand(true);

        if (sub === "list") await this.listCommand(i);
        else if (sub === "info") await this.infoCommand(i);
        else if (sub === "set") await this.setCommand(i);
        else if (sub === "help") await this.helpCommand(i);
    }

    async helpCommand(i: IncomingSlashCommand) {
        await i.reply({
            embeds: [
                defaultEmbed()
                    .setTitle("Config help")
                    .setDescription(
                        "Configs are quite a complicated system, but since Crossant is moving towards being fully slash commands (message commands will be disabled soon), some parts of it are easy and intuitive " +
                            "but others are hard. After reading this you should have a pretty decent idea of how to use configs",
                    )
                    .addField(
                        "Getting information",
                        "To see what config entries are available, you can do `/config list entry:name` or to see info about a specific setting (and if you have permission to change it, `/config info entry:name`",
                    )
                    .addField(
                        "Basic values",
                        "Changing the value of settings is where it starts getting complicated. The `/config info` command gives you copy and pasteable command that you just need to change the value of.\n" +
                            "If the setting **isn't** an array, it is just a case of `/config set entry:name setting_type:setting_value`. e.g, for a boolean, `/config set entry:name boolean:value`. Don't worry, if you get the type wrong, the bot will tell you!",
                    )
                    .addField(
                        "Arrays",
                        "If the setting **is** an array, you have to always use the string type. The bot will try to make sense of this as best it can. To separate values you use a comma (no space). " +
                            "For a boolean value, you could use `y,yes,true,false,f,no,n` as a value, or for a number value you could use `1,53,124,134.12`",
                    )
                    .addField(
                        "Compatibility",
                        '"Wait! But what if I need a comma in my value??". Don\'t worry, we thought of this! Simply put a backslash (\\ not /) in front of the comma (on some devices its a double backslash). For example, `first value, second\\, value` would be interpreted as `["first value", "second, value"]`',
                    ),
            ],
        });
    }

    async setCommand(i: IncomingSlashCommand) {
        if (!i.member || !i.guild)
            throw "This command can only be used in a guild";

        const entryName = i.options.getString("entry", true) as ValueOf<
            typeof guildSettingNames
        >;

        if (!(entryName in guildSettings))
            throw "Config entry not found. If you think this was a mistake, try again in a few minutes to let the bot update everywhere";

        const entry = guildSettings[entryName];

        if (entry.permission && !i.member.permissions.has(entry.permission))
            throw "No permission";

        let value: any;

        if (entry.arrayType) {
            const str = i.options.getString("string", true);
            const parts = carefulSplit(str, ",");

            const final: any[] = [];
            const parserfn = settingParsers[entry.type];

            for (const part of parts) {
                final.push(parserfn(part));
            }

            value = final;
        } else if (entry.type === SettingType.BOOLEAN)
            value = i.options.getBoolean("boolean", true);
        else if (entry.type === SettingType.NUMBER)
            value = i.options.getInteger("number", true);
        else if (entry.type === SettingType.CHANNEL)
            value = i.options.getChannel("channel", true).id;
        else if (entry.type === SettingType.USER)
            value = i.options.getUser("user", true).id;
        else if (entry.type === SettingType.ROLE)
            value = i.options.getRole("role", true).id;
        else value = i.options.getString("string", true);

        const guilds = this.module.managers.get(ManagerNames.GuildManager);
        if (!guilds) throw "No guild manager";

        await guilds.setSetting(i.guild, entryName, value, entry.type);

        await i.reply(
            `${entryName} is now set to \`${
                Array.isArray(value) ? `["${value.join('", "')}"]` : value
            }\``,
        );
    }

    async infoCommand(i: IncomingSlashCommand) {
        const entryName = i.options.getString("entry", true) as ValueOf<
            typeof guildSettingNames
        >;

        if (!(entryName in guildSettings))
            throw "Config entry not found. If you think this was a mistake, try again in a few minutes to let the bot update everywhere";

        const entry = guildSettings[entryName];

        await i.reply({
            embeds: [
                defaultEmbed()
                    .setTitle(`${entryName}`)
                    .setDescription(
                        stripIndents`
                        To change this setting, run \`/config set ${entryName} ${
                            entry.arrayType
                                ? "string:some_value,another_value"
                                : `${entry.type.toLowerCase()}:some_value`
                        }\`
                        To see all settings, run \`/config list\`
                    `,
                    )
                    .addField(
                        "Info",
                        stripIndents`
                        **Description**: ${entry.description} ${
                            entry.defaultValue
                                ? `\n**Default**: ${entry.defaultValue}`
                                : ""
                        }
                        **Type**: ${entry.type.toLowerCase()}${
                            entry.arrayType
                                ? " (array, separate with a comma)"
                                : ""
                        }
                        ${
                            entry.permission
                                ? `**Permission needed**: ${entry.permission
                                      .toLowerCase()
                                      .replace("_", " ")} ${
                                      i.member
                                          ? `(You ${
                                                i.member.permissions.has(
                                                    entry.permission,
                                                )
                                                    ? "**do**"
                                                    : "**don't**"
                                            } have permission to alter this setting)`
                                          : ""
                                  }`
                                : ""
                        }
                    `,
                    ),
            ],
        });
    }

    async listCommand(i: IncomingSlashCommand) {
        let currentPage = 0;
        let sent = false;
        const embed = defaultEmbed(false).setTitle("Config entry list");
        const keys = Object.keys(guildSettings);

        const calcPage = async () => {
            if (!(i.channel instanceof GuildChannel) || !i.channel.isText())
                throw "Must be ran in a guild and in a text channel";

            let list =
                "To set a specific setting, run `/config set entryname`. For this, you will need to specify a specific option, e.g. for a channel, channel:#channel or for a member, user:@user\n" +
                "To get information about a specific setting, run `/config info entryname`.\n" +
                "Use the buttons below to navigate the page\n\n";

            for (
                let i = currentPage * 10 - 1;
                i < (currentPage + 1) * 10;
                i++
            ) {
                if (keys[i]) {
                    const setting = guildSettings[keys[i]];

                    list += ` **•** **\`${keys[i]}\`:** ${
                        setting.description
                    }\n     **Type:** \`${setting.type.toLowerCase()}\`, ${
                        setting.defaultValue
                            ? `**Default:** \`${setting.defaultValue}\``
                            : "no defaults"
                    }${
                        setting.permission
                            ? `, **Permission:** \`${setting.permission}\``
                            : ""
                    }\n`;
                }
            }

            embed.setDescription(list);
            embed.setFooter(
                `Page ${currentPage + 1}/${Math.ceil(keys.length / 10)}`,
            );

            const buttons = new MessageActionRow({
                components: [
                    new MessageButton({
                        style: "SECONDARY",
                        customId: "previous",
                        label: "Previous",
                        emoji: "⬅️",
                        disabled: currentPage === 0,
                    }),
                    new MessageButton({
                        style: "SECONDARY",
                        customId: "next",
                        label: "Next",
                        emoji: "➡️",
                        disabled: keys.length > currentPage * 10,
                    }),
                ],
            });

            let message: Message | APIMessage;
            if (sent)
                message = await i.editReply({
                    embeds: [embed],
                    components: [buttons],
                });
            else {
                sent = true;
                message = await i.reply({
                    embeds: [embed],
                    components: [buttons],
                });
            }

            const component = await i.channel.awaitMessageComponent({
                componentType: "BUTTON",
                filter: (c) =>
                    c.user.id === i.user.id &&
                    ["previous", "next"].includes(c.customId) &&
                    c.message.id === message.id,
                time: 5 * 60 * 1000,
            });

            if (component) {
                if (component.customId === "previous") currentPage--;
                else if (component.customId === "next") currentPage++;
                await calcPage();
            }
        };

        await calcPage();
    }
}
