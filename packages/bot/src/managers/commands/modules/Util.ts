import { Message, MessageEmbed } from "discord.js";
import { ManagerNames } from "src/managers/common/managers";
import InfoCommand from "src/managers/commands/modules/util/Info";
import PingMessageCommand from "src/managers/commands/modules/util/PingMessage";
import { defaultEmbed } from "src/util/messages/embeds";
import { guildSettingNames } from "src/settings/settings";
import Module from "../structures/Module";
import HelpCommand from "./util/Help";

export default class UtilModule extends Module {
    constructor() {
        super("util");
    }

    load(): void | Promise<void> {
        this.registerCommand(
            new HelpCommand(),
            new InfoCommand(),
            new PingMessageCommand(),
        );

        this.managers.bot.client.on("messageCreate", (m) => this.message(m));
    }

    async message(m: Message) {
        if (
            m.guild &&
            m.mentions.members &&
            m.mentions.members.size >= 1 &&
            !m.author.bot
        ) {
            const guilds = this.managers.get(ManagerNames.GuildManager);
            if (!guilds) return;

            const pmsg = (await guilds.getBasicSetting(
                m.guild,
                guildSettingNames.PingMessageEnabled,
            )) as boolean;
            if (!pmsg) return;

            const pingmsgs = await this.managers.bot.db.pingMessage.findMany({
                where: {
                    guildId: m.guild.id,
                    userId: {
                        in: Array.from(m.mentions.members.values()).map(
                            (u) => u.id,
                        ),
                    },
                },
            });
            const embeds: MessageEmbed[] = [];
            for (const pingmsg of pingmsgs) {
                if (
                    (!m.mentions.repliedUser ||
                        pingmsg.userId !== m.mentions.repliedUser.id) &&
                    pingmsg.userId !== m.author.id
                ) {
                    const embed = defaultEmbed().setDescription(
                        pingmsg.message,
                    );
                    embed.footer = null;
                    embeds.push(embed);
                }
            }
            if (embeds.length > 0) {
                const msg = await m.reply({ embeds });

                setTimeout(async () => {
                    if (msg.deletable) await msg.delete();
                }, 10000);
            }
        }
    }
}
