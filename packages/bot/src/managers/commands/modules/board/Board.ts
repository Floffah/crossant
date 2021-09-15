import { Prisma, PrismaClient } from "@prisma/client";
import { GuildChannel } from "discord.js";
import IncomingSlashCommand from "src/managers/commands/structures/IncomingSlashCommand";
import SlashCommand from "src/managers/commands/structures/SlashCommand";
import { defaultEmbed } from "src/util/messages/embeds";

export default class BoardCommand extends SlashCommand {
    constructor() {
        super("board", "Board configuration", (s) =>
            s
                .addSubcommand((c) =>
                    c
                        .setName("create")
                        .setDescription("Create a board")
                        .addStringOption((o) =>
                            o
                                .setName("emoji")
                                .setDescription("Emoji to count")
                                .setRequired(true),
                        )
                        .addChannelOption((o) =>
                            o
                                .setName("channel")
                                .setDescription(
                                    "Channel to send board messages",
                                )
                                .setRequired(true),
                        )
                        .addIntegerOption((o) =>
                            o
                                .setName("min")
                                .setDescription(
                                    "Minimum reactions needed to send a message in the board channel",
                                )
                                .setRequired(false),
                        ),
                )
                .addSubcommand((c) =>
                    c
                        .setName("edit")
                        .setDescription("Edit a boards information")
                        .addIntegerOption((o) =>
                            o
                                .setName("id")
                                .setDescription(
                                    "ID of the board (run `/board list #channel` to find it)",
                                )
                                .setRequired(true),
                        )
                        .addIntegerOption((o) =>
                            o
                                .setName("min")
                                .setDescription(
                                    "Minimum reactions needed to send a message in the board channel",
                                )
                                .setRequired(false),
                        ),
                )
                .addSubcommand((c) =>
                    c
                        .setName("delete")
                        .setDescription("Delete a board")
                        .addIntegerOption((o) =>
                            o
                                .setName("id")
                                .setDescription(
                                    "ID of the board (run `/board list #channel` to find it)",
                                )
                                .setRequired(true),
                        ),
                )
                .addSubcommand((c) =>
                    c
                        .setName("list")
                        .setDescription(
                            "Find boards in the current guild or in a specified channel",
                        )
                        .addChannelOption((o) =>
                            o
                                .setName("channel")
                                .setDescription("Channel to search")
                                .setRequired(false),
                        ),
                ),
        );
    }

    async incoming(i: IncomingSlashCommand) {
        const sub = i.options.getSubcommand(true);

        console.log(sub);

        if (sub === "create") await this.create(i);
        else if (sub === "edit") await this.edit(i);
        else if (sub === "delete") await this.delete(i);
        else if (sub === "list") await this.list(i);
    }

    async create(i: IncomingSlashCommand) {
        if (!i.guild || !i.member) throw "Must be ran in a guild";
        if (
            !i.member.permissions.has("MANAGE_CHANNELS", true) ||
            !i.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS")
        )
            throw "Must have permission MANAGE_CHANNELS and MANAGE_EMOJIS";

        const emoji = i.options
            .getString("emoji", true)
            .replace(/(^:|:$|^<:[A-z]+:|>$)/g, "");

        let channel = i.options.getChannel("channel", true);
        if (!(channel instanceof GuildChannel)) {
            const fetched = await i.guild.channels.fetch(channel.id);
            if (!fetched) throw "Invalid channel";
            channel = fetched;
        }
        if (!channel.isText()) throw "Channel must be text based";
        if (!i.channel.isText()) throw "Current channel must be text";

        const minReactions = i.options.getInteger("min");

        const reacter = await i.channel.send("Finding emoji identifier...");
        const reaction = await reacter.react(emoji);

        await reacter.edit(
            `~~${reacter.content}~~ Found identifier: ${reaction.emoji.identifier}`,
        );

        const existing = await this.module.managers.bot.db.guildBoard.findFirst(
            {
                where: {
                    channelId: channel.id,
                    emoji: reaction.emoji.identifier,
                },
            },
        );

        if (existing)
            throw `A guild board already exists for ${emoji} in <#${channel.id}>. Run \`/board delete ${existing.id}\` to remove it.`;

        const guildboard = await this.module.managers.bot.db.guildBoard.create({
            data: {
                channelId: channel.id,
                emoji: reaction.emoji.identifier,
                minReactions: minReactions ?? undefined,
                guild: {
                    connectOrCreate: {
                        where: {
                            id: i.guild.id,
                        },
                        create: {
                            id: i.guild.id,
                        },
                    },
                },
            },
        });
        await reaction.remove();
        if (!guildboard) throw "Error while creating guild board";

        await i.reply(
            `Created guild board in <#${channel.id}> with emoji ${emoji}`,
        );
    }

    async edit(i: IncomingSlashCommand) {
        if (!i.guild || !i.member) throw "Must be ran in a guild";
        if (
            !i.member.permissions.has("MANAGE_CHANNELS", true) ||
            !i.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS")
        )
            throw "Must have permission MANAGE_CHANNELS and MANAGE_EMOJIS";

        const id = i.options.getInteger("id", true);

        const found = await this.module.managers.bot.db.guildBoard.findFirst({
            where: {
                id: id,
            },
        });

        if (!found)
            throw `Could not find guild board of id ${id}. Use \`/board list\` to find guild boards for a specific channel`;
        if (found.guildId !== i.guild.id)
            throw `Guild board of id ${id} does not belong to this guild`;

        const editMsg: string[] = [];

        const minReactions = i.options.getInteger("min");

        const update: Parameters<
            typeof PrismaClient.prototype.guildBoard.update
        >[0]["data"] = {};

        if (minReactions) {
            editMsg.push(
                `Minimum reactions: **${found.minReactions}** -> **${minReactions}**`,
            );
            update.minReactions = found.minReactions;
        }

        await this.module.managers.bot.db.guildBoard.update({
            data: update,
            where: {
                id: found.id,
            },
        });

        await i.reply(
            `Edited the following information:\n${editMsg
                .map((s) => ` - ${s}`)
                .join("\n")}`,
        );
    }

    async delete(i: IncomingSlashCommand) {
        if (!i.guild || !i.member) throw "Must be ran in a guild";
        if (
            !i.member.permissions.has("MANAGE_CHANNELS", true) ||
            !i.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS")
        )
            throw "Must have permission MANAGE_CHANNELS and MANAGE_EMOJIS";

        const id = i.options.getInteger("id", true);

        const found = await this.module.managers.bot.db.guildBoard.findFirst({
            where: {
                id: id,
            },
        });

        if (!found)
            throw `Could not find guild board of id ${id}. Use \`/board list\` to find guild boards for a specific channel`;
        if (found.guildId !== i.guild.id)
            throw `Guild board of id ${id} does not belong to this guild`;

        await this.module.managers.bot.db.guildBoard.delete({
            where: {
                id: id,
            },
        });
        await this.module.managers.bot.db.guildBoardMessage.deleteMany({
            where: {
                boardId: id,
            },
        });

        let writableemoji = "";

        if (found.emoji.includes(":")) {
            writableemoji = `<:${found.emoji}>`;
        } else {
            writableemoji = `:${found.emoji}:`;
        }

        await i.reply(
            `Deleted guild board of id ${id} (${writableemoji} in channel <#${found.channelId}>)`,
        );
    }

    async list(i: IncomingSlashCommand) {
        if (!i.guild || !i.member) throw "Must be ran in a guild";

        const channel = i.options.getChannel("channel");

        const where: Prisma.GuildBoardWhereInput = {
            guildId: i.guild.id,
        };

        if (channel) {
            if (channel.type !== "GUILD_TEXT" && channel.type !== "GUILD_NEWS")
                throw "Must be a text based channel";

            if (channel.guild.id !== i.guild.id)
                throw "Channel must be present on the current guild";

            where.channelId = channel.id;
        }

        const boards = await this.module.managers.bot.db.guildBoard.findMany({
            where,
        });

        if (boards.length <= 0) throw "This guild or channel has no boards";

        let content = "";

        for (const board of boards) {
            let writableemoji = "";

            if (board.emoji.includes(":")) {
                writableemoji = `<:${board.emoji}>`;
            } else {
                writableemoji = `:${board.emoji}:`;
            }

            content += `${board.id}: ${writableemoji} in <#${board.channelId}>`;
        }

        content = content.replace(/\n$/, "");

        await i.reply({
            embeds: [defaultEmbed().setDescription(content)],
        });
    }
}
