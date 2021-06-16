import Command from "../../structure/Command";
import IncomingCommand from "../../structure/IncomingCommand";
import { CommandInteractionOption, Guild, GuildMember } from "discord.js";
import { Modify } from "../../util/types";
import { Prisma } from "@prisma/client";
import { defaultEmbed } from "../../util/embeds";

export default class Board extends Command {
    constructor() {
        super("board", "Board configuration commands", [
            {
                name: "create",
                description: "Create a board",
                type: "SUB_COMMAND",
                options: [
                    {
                        name: "emoji",
                        description: "Emoji to count",
                        required: true,
                        type: "STRING",
                    },
                    {
                        name: "channel",
                        description: "Channel to dump into",
                        type: "CHANNEL",
                        required: true,
                    },
                ],
            },
            {
                name: "delete",
                description: "Delete a board",
                type: "SUB_COMMAND",
                options: [
                    {
                        name: "id",
                        description:
                            "ID of the board (run `/board list channel` to find it",
                        type: "INTEGER",
                        required: true,
                    },
                ],
            },
            {
                name: "list",
                description: "Find boards of a channel",
                type: "SUB_COMMAND",
                options: [
                    {
                        name: "channel",
                        description: "Channel to search",
                        type: "CHANNEL",
                    },
                ],
            },
        ]);
    }

    async incoming(i: IncomingCommand) {
        if (typeof i.guild === "undefined" || typeof i.member === "undefined")
            throw "Must be ran by a guild member in a guild";

        if (i.options.has("create"))
            await this.create(i as BoardSubCommandIncomingCommand);
        else if (i.options.has("delete"))
            await this.delete(i as BoardSubCommandIncomingCommand);
        else if (i.options.has("list"))
            await this.list(i as BoardSubCommandIncomingCommand);
        else throw "Invalid subcommand";
    }

    async create(i: BoardSubCommandIncomingCommand) {
        if (
            !i.member.permissions.has("MANAGE_CHANNELS", true) ||
            !i.member.permissions.has("MANAGE_EMOJIS")
        )
            throw "Must have permission MANAGE_CHANNELS and MANAGE_EMOJIS";

        const options = i.options.get("create") as CommandInteractionOption;
        if (!options.options) throw "Must pass emoji and channel options";

        const emoji = options.options.get("emoji");
        if (!emoji || !emoji.value || typeof emoji.value !== "string")
            throw "Incorrect emoji value";

        const channel = options.options.get("channel");
        if (!channel || !channel.channel) throw "Invalid channel";
        if (channel.channel.type !== "text" && channel.channel.type !== "news")
            throw "Channel must be text based";

        const e = emoji.value.replace(/(^:|:$|^<:[A-z]+:|>$)/g, "");

        if (i.channel.isText()) {
            const reacter = await i.channel.send("Finding emoji identifier...");
            const reaction = await reacter.react(e);

            await reacter.edit(
                `~~${reacter.content}~~ Found identifier: ${reaction.emoji.identifier}`,
            );

            const existing = await this.module.bot.db.guildBoard.findFirst({
                where: {
                    channelId: channel.channel.id,
                    emoji: reaction.emoji.identifier,
                },
            });

            if (existing)
                throw `A guild board already exists for ${emoji.value} in <#${channel.channel.id}>. Run \`/board delete ${existing.id}\` to remove it.`;

            const guildboard = await this.module.bot.db.guildBoard.create({
                data: {
                    channelId: channel.channel.id,
                    emoji: reaction.emoji.identifier,
                    guildId: i.guild.id,
                },
            });
            await reaction.remove();
            if (!guildboard) throw "Error while creating guild board";

            await i.reply(
                `Created guild board in <#${channel.channel.id}> with emoji ${emoji.value}`,
            );
        } else {
            throw "Target channel must be a text channel";
        }
    }

    async delete(i: BoardSubCommandIncomingCommand) {
        if (
            !i.member.permissions.has("MANAGE_CHANNELS", true) ||
            !i.member.permissions.has("MANAGE_EMOJIS")
        )
            throw "Must have permission MANAGE_CHANNELS and MANAGE_EMOJIS";

        const options = i.options.get("delete") as CommandInteractionOption;
        if (!options.options) throw "Must pass id option";

        const id = options.options.get("id");
        if (!id || typeof id.value !== "number")
            throw "Must pass id option. Use `/board list` to find guild boards for a specific channel";

        const found = await this.module.bot.db.guildBoard.findFirst({
            where: {
                id: id.value,
            },
        });

        if (!found)
            throw `Could not find guild board of id ${id.value}. Use \`/board list\` to find guild boards for a specific channel`;
        if (found.guildId !== i.guild.id)
            throw `Guild board of it ${id.value} does not belong to this guild`;

        await this.module.bot.db.guildBoard.delete({
            where: {
                id: id.value,
            },
        });
        await this.module.bot.db.guildBoardMessage.deleteMany({
            where: {
                boardId: id.value,
            },
        });

        let writableemoji = "";

        if (found.emoji.includes(":")) {
            writableemoji = `<:${found.emoji}>`;
        } else {
            writableemoji = `:${found.emoji}:`;
        }

        await i.reply(
            `Deleted guild board of id ${id.value} (${writableemoji} in channel <#${found.channelId}>)`,
        );
    }

    async list(i: BoardSubCommandIncomingCommand) {
        const options = i.options.get("list") as CommandInteractionOption;

        const where: Prisma.GuildBoardWhereInput = {
            guildId: i.guild.id,
        };

        if (options.options) {
            const channel = options.options.get("channel");
            if (channel && channel.channel) {
                if (
                    channel.channel.type !== "text" &&
                    channel.channel.type !== "news"
                )
                    throw "Must be a text based channel";

                if (channel.channel.guild.id !== i.guild.id)
                    throw "Channel must be present on the current guild";

                where.channelId = channel.channel.id;
            }
        }

        const boards = await this.module.bot.db.guildBoard.findMany({
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

        await i.reply(undefined, {
            embeds: [defaultEmbed().setDescription(content)],
        });
    }
}

export type BoardSubCommandIncomingCommand = Modify<
    IncomingCommand,
    {
        guild: Guild;
        member: GuildMember;
    }
>;
