import {
    MessageAttachment,
    MessageReaction,
    PartialMessageReaction,
    PartialUser,
    Snowflake,
    TextChannel,
    User,
} from "discord.js";
import BoardCommand from "src/managers/commands/modules/board/Board";
import Module from "src/managers/commands/structures/Module";
import { defaultEmbed } from "src/util/embeds";

export default class BoardsModule extends Module {
    constructor() {
        super("boards");
    }

    load() {
        this.registerCommand(new BoardCommand());

        this.managers.bot.client.on(
            "messageReactionAdd",
            async (r, u) => await this.reactionEvent(r, u),
        );
        this.managers.bot.client.on(
            "messageReactionRemove",
            async (r, u) => await this.reactionEvent(r, u),
        );
    }

    async reactionEvent(
        r: MessageReaction | PartialMessageReaction,
        _u: User | PartialUser,
    ) {
        if (r.partial) r = await r.fetch();

        if (
            !r.message.guild ||
            r.me ||
            (r.message.author && r.message.author.bot)
        )
            return;

        const found = await this.managers.bot.db.guildBoard.findFirst({
            where: {
                emoji: r.emoji.identifier,
                guildId: r.message.guild.id,
            },
        });

        if (!found) return;

        const existing = await this.managers.bot.db.guildBoardMessage.findFirst(
            {
                where: {
                    channelId: found.channelId,
                    reactedChannelId: r.message.channel.id,
                    reactedMessageId: r.message.id,
                },
            },
        );

        if (existing && r.count < 1) {
            const ch = (await this.managers.bot.client.channels.fetch(
                found.channelId as Snowflake,
            )) as TextChannel;
            const m = await ch.messages.fetch(existing.messageId as Snowflake);
            await this.managers.bot.db.guildBoardMessage.delete({
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

        if (r.count < 1) return;
        if (!r.message.author) return;

        const user = await r.message.author.fetch();
        const avatar = user.avatarURL();

        const embed = defaultEmbed().setAuthor(
            `${user.username}#${user.discriminator}`,
            avatar ? avatar : undefined,
        );

        let messageContent = "";

        if (r.message.content) messageContent += r.message.content + "\n\n";

        messageContent += `[Jump](${r.message.url})`;

        embed.setDescription(messageContent);

        let writableemoji = "";

        if (found.emoji.includes(":")) {
            writableemoji = `<:${found.emoji}>`;
        } else {
            writableemoji = `${decodeURIComponent(found.emoji)}`;
        }

        const content = `${writableemoji}  **${r.count ?? "1"}**`;

        if (r.message.attachments && r.message.attachments.size > 0) {
            embed.setImage(
                (r.message.attachments.first() as MessageAttachment).proxyURL,
            );
        }

        const ch = (await this.managers.bot.client.channels.fetch(
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

            await this.managers.bot.db.guildBoardMessage.create({
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
