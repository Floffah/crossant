import IncomingSlashCommand from "src/managers/commands/structures/IncomingSlashCommand";
import SlashCommand from "src/managers/commands/structures/SlashCommand";
import { ShardMessage } from "src/util/shardmessages";

export default class DevCommand extends SlashCommand {
    constructor() {
        super("dev", "Bot debug and dev commands", (s) =>
            s
                .addSubcommand((s) =>
                    s
                        .setName("check")
                        .setDescription(
                            "Checks for git updates and restarts all shards",
                        ),
                )
                .addSubcommand((s) =>
                    s
                        .setName("respawn")
                        .setDescription("Respawn all or specific shards")
                        .addStringOption((o) =>
                            o
                                .setName("shards")
                                .setDescription(
                                    "Optional shards to respawn (separate by ,)",
                                )
                                .setRequired(false),
                        ),
                ),
        );
    }

    async incoming(i: IncomingSlashCommand) {
        if (!this.module.managers.bot.config.bot.owners.includes(i.user.id))
            throw "Must be a bot admin";

        const sub = i.options.getSubcommand(true);

        if (sub === "check") await this.checkCmd(i);
        else if (sub === "respawn") await this.respawnCmd(i);
    }

    async checkCmd(i: IncomingSlashCommand) {
        await i.reply("Checking for updates. This shard may restart.");
        this.module.managers.bot.client.shard?.send({
            type: "check",
        } as ShardMessage);
    }

    async respawnCmd(i: IncomingSlashCommand) {
        const shards = i.options.getString("shards");

        await i.reply(
            `Respawning ${
                shards ? `shards ${shards.split(",").join(", ")}` : "all shards"
            }. This shard may restart.`,
        );
        this.module.managers.bot.client.shard?.send({
            type: "respawn",
            data: shards
                ? {
                      ids: shards.split(","),
                  }
                : undefined,
        } as ShardMessage);
    }
}
