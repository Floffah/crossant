import IncomingSlashCommand from "src/managers/commands/structures/IncomingSlashCommand";
import SlashCommand from "src/managers/commands/structures/SlashCommand";

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
        if (!i.hasGuild) throw "Must be ran in a guild";

        const sub = i.options.getSubcommand(true);

        if (sub === "create") await this.create(i);
    }

    async create(i: IncomingSlashCommand) {
        i.reply("sdfdsf");
    }
}
