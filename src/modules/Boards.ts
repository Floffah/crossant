import Module from "../structure/Module";
import Board from "./boards/Board";
import {
    MessageAttachment,
    MessageReaction,
    PartialUser,
    Snowflake,
    TextChannel,
    User,
} from "discord.js";
import { defaultEmbed } from "../util/embeds";

export default class Boards extends Module {
    constructor() {
        super("boards");
    }

    load() {
        this.registerCommand(new Board());
    }

    ready() {
        this.bot.on("messageReactionAdd", async (r, u) =>
            this.reactionEvent(r, u),
        );
        this.bot.on("messageReactionRemove", (r, u) =>
            this.reactionEvent(r, u),
        );
    }

    async reactionEvent(r: MessageReaction, _u: User | PartialUser) {
        const reaction = await r.fetch();
        if (!reaction.message.guild) return;
        if (reaction.me) return;
        if (reaction.message.author && reaction.message.author.bot) return;
        if (typeof reaction.count !== "number") return;

        const found = await this.bot.db.guildBoard.findFirst({
            where: {
                //channelId: reaction.message.channel.id,
                emoji: reaction.emoji.identifier,
                guildId: reaction.message.guild.id,
            },
        });

        if (found) {
            const existing = await this.bot.db.guildBoardMessage.findFirst({
                where: {
                    channelId: found.channelId,
                    reactedChannelId: reaction.message.channel.id,
                    reactedMessageId: reaction.message.id,
                },
            });

            if (existing && reaction.count <= 1) {
                const ch = (await this.bot.channels.fetch(
                    found.channelId as Snowflake,
                )) as TextChannel;
                const m = await ch.messages.fetch(
                    existing.messageId as Snowflake,
                );
                await this.bot.db.guildBoardMessage.delete({
                    where: {
                        reactedMessageId_reactedChannelId: {
                            reactedMessageId: existing.reactedMessageId,
                            reactedChannelId: existing.reactedChannelId,
                        },
                    },
                });
                try {
                    if (m) await m.delete();
                } catch (e) {
                    return;
                }
                return;
            }

            if (reaction.count <= 1) return;
            if (!reaction.message.author) return;

            const user = await reaction.message.author.fetch();
            const avatar = user.avatarURL();

            const embed = defaultEmbed().setAuthor(
                `${user.username}#${user.discriminator}`,
                avatar ? avatar : undefined,
            );

            let messageContent = "";

            if (reaction.message.content)
                messageContent += reaction.message.content += "\n";

            messageContent += `[Jump](${reaction.message.url})`;

            embed.setDescription(messageContent);

            let writableemoji = "";

            if (found.emoji.includes(":")) {
                writableemoji = `<:${found.emoji}>`;
            } else {
                writableemoji = `:${found.emoji}:`;
            }

            const content = `${writableemoji}  **${reaction.count ?? "1"}**`;

            if (r.message.attachments && r.message.attachments.size > 0) {
                embed.setImage(
                    (r.message.attachments.first() as MessageAttachment)
                        .proxyURL,
                );
            }

            const ch = (await this.bot.channels.fetch(
                found.channelId as Snowflake,
            )) as TextChannel | null;

            if (!ch) return;

            if (existing) {
                const boardMessage = await ch.messages.fetch(
                    existing.messageId as Snowflake,
                );

                if (boardMessage) {
                    await boardMessage.edit({
                        embeds: [embed],
                        content,
                    });
                }
            } else {
                const sent = await ch.send({ embeds: [embed], content });

                await this.bot.db.guildBoardMessage.create({
                    data: {
                        channelId: sent.channel.id,
                        messageId: sent.id,
                        reactedChannelId: r.message.channel.id,
                        reactedMessageId: r.message.id,
                        boardId: found.id,
                    },
                });
            }
        }
    }
}
