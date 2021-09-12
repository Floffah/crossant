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
import { guildSettingNames, guildSettings } from "src/util/settings";
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
                );

            return s;
        });
    }

    async incoming(i: IncomingSlashCommand) {
        const sub = i.options.getSubcommand(true);

        if (sub === "list") await this.listCommand(i);
        else if (sub === "info") await this.infoCommand(i);
        else if (sub === "set") await this.setCommand(i);
    }

    async setCommand(i: IncomingSlashCommand) {
        if (!i.member || !i.guild)
            throw "This command can only be used in a guild";
        console.log(1);

        const entryName = i.options.getString("entry", true) as ValueOf<
            typeof guildSettingNames
        >;
        console.log(2);

        if (!(entryName in guildSettings))
            throw "Config entry not found. If you think this was a mistake, try again in a few minutes to let the bot update everywhere";
        console.log(3);

        const entry = guildSettings[entryName];

        if (entry.permission && !i.member.permissions.has(entry.permission))
            throw "No permission";
        console.log(4);

        let value: any;

        if (entry.type === SettingType.BOOLEAN)
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
        console.log(5);

        const guilds = this.module.managers.get(ManagerNames.GuildManager);
        if (!guilds) throw "No guild manager";
        console.log(6);

        await guilds.setSetting(i.guild, entryName, value, entry.type);
        console.log(7);

        await i.reply(`${entryName} is now set to \`${value}\``);
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
                        To change this setting, run \`/config set ${entryName} ${entry.type.toLowerCase()}:${
                            entry.arrayType
                                ? "some_value,another_value"
                                : "some_value"
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

                    list += ` - **\`${keys[i]}\`:** ${
                        setting.description
                    } **Type:** \`${setting.type.toLowerCase()}\`, **Default:** \`${
                        setting.defaultValue
                    }\`${
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
