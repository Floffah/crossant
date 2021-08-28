import { APIMessage } from "discord-api-types/v9";
import {
    GuildChannel,
    Message,
    MessageActionRow,
    MessageButton,
} from "discord.js";
import IncomingSlashCommand from "src/managers/commands/structures/IncomingSlashCommand";
import SlashCommand from "src/managers/commands/structures/SlashCommand";
import { defaultEmbed } from "src/util/embeds";
import { guildSettings } from "src/util/settings";

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
                                .setName("int")
                                .setDescription("Value as an integer"),
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

                    list += ` - **\`${keys[i]}:\`** ${
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
