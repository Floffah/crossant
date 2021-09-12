import { ManagerNames } from "src/managers/commands/managers";
import IncomingSlashCommand from "src/managers/commands/structures/IncomingSlashCommand";
import SlashCommand from "src/managers/commands/structures/SlashCommand";
import { defaultEmbed } from "src/util/embeds";
import { guildSettingNames } from "src/util/settings";

export default class PingMessageCommand extends SlashCommand {
    constructor() {
        super(
            "pingmsg",
            "Set or remove the message the bot will send when you get mentioned",
            (b) =>
                b
                    .addSubcommand((s) =>
                        s
                            .setName("set")
                            .setDescription(
                                "Set the message the bot will send when you get mentioned",
                            )
                            .addStringOption((o) =>
                                o
                                    .setName("message")
                                    .setDescription(
                                        "The message to set. Is prefixed with '@member is...'",
                                    )
                                    .setRequired(true),
                            ),
                    )
                    .addSubcommand((s) =>
                        s
                            .setName("remove")
                            .setDescription(
                                "Remove the message the bot will send when you get mentioned",
                            ),
                    ),
            {
                aliases: ["pmsg"],
            },
        );
    }

    async incoming(i: IncomingSlashCommand) {
        const sub = i.options.getSubcommand(true);

        if (sub === "set") await this.setCmd(i);
        else if (sub === "remove") await this.removeCmd(i);
    }

    async setCmd(i: IncomingSlashCommand) {
        if (!i.guild) throw "Must be in a guild";

        const guilds = this.module.managers.get(ManagerNames.GuildManager);
        if (!guilds) throw "No guild manager";

        const pmsg = (await guilds.getBasicSetting(
            i.guild,
            guildSettingNames.PingMessageEnabled,
        )) as boolean;

        if (!pmsg) throw "Ping messages are disabled in this guild";

        const message = `<@${i.user.id}> is ${i.options.getString(
            "message",
            true,
        )}`;
        await this.module.managers.bot.db.pingMessage.upsert({
            where: {
                userId_guildId: {
                    guildId: i.guild.id,
                    userId: i.user.id,
                },
            },
            create: {
                guild: {
                    connectOrCreate: {
                        create: {
                            id: i.guild.id,
                        },
                        where: {
                            id: i.guild.id,
                        },
                    },
                },
                user: {
                    connectOrCreate: {
                        where: {
                            id: i.user.id,
                        },
                        create: {
                            id: i.user.id,
                        },
                    },
                },
                message,
            },
            update: {
                message,
            },
        });

        const embed = defaultEmbed().setDescription(message);

        embed.footer = null;
        await i.reply({
            content: "Set your ping message for this guild to the following:",
            embeds: [embed],
        });
    }

    async removeCmd(i: IncomingSlashCommand) {
        if (!i.guild) throw "Must be in a guild";

        const existed =
            await this.module.managers.bot.db.pingMessage.findUnique({
                where: {
                    userId_guildId: {
                        guildId: i.guild.id,
                        userId: i.user.id,
                    },
                },
            });

        if (!existed) {
            await i.reply(`You don't have a ping message in this guild!`);
            return;
        }

        await this.module.managers.bot.db.pingMessage.delete({
            where: {
                userId_guildId: {
                    guildId: i.guild.id,
                    userId: i.user.id,
                },
            },
        });

        await i.reply(`Deleted your ping message in this guild!`);
    }
}
