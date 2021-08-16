import chalk from "chalk";
import { ShardingManager } from "discord.js";
import { existsSync, readFileSync } from "fs";
import { parse } from "ini";
import { resolve } from "path";
import pluralize from "pluralize";

const keypress = require("keypress");

export async function startShards() {
    const log = (msg: string, err = false) =>
        (err ? console.error : console.log)(
            chalk`{red !}{magenta manager} ${msg}`,
        );

    log("Starting shards");

    const configpath = resolve(process.cwd(), ".crossant", "config.ini");
    if (!existsSync(configpath)) throw "No config";

    const config = parse(readFileSync(configpath, "utf-8"));

    const shards = new ShardingManager(resolve(__dirname, "rawstart.js"), {
        totalShards: "auto",
        mode: "worker",
        token: config.bot.token,
        respawn: true,
    });

    shards.on("shardCreate", (shard) => {
        log(`Shard ${shard.id} created`);
    });

    keypress(process.stdin);
    process.stdin.on("keypress", async (_s, key) => {
        if (key.ctrl && key.name === "r") {
            log(`Respawning all shards`);
            const which: number[] = [];
            const faults: number[] = [];

            for (const s of shards.shards.values()) {
                log(`Respawning shard ${s.id}`);
                try {
                    await s.respawn();
                    which.push(s.id);
                } catch (e) {
                    log(`Shard ${s.id} failed to respawn. ${e.message}`, true);
                    faults.push(s.id);
                }
            }

            log(
                `Respawned ${which.length} ${pluralize(
                    "shards",
                    which.length,
                )} successfully (${[...which.join(",")]}) ${
                    faults.length > 0
                        ? `with ${faults.length} broken ${pluralize(
                              "shards",
                              faults.length,
                          )} (${faults.join(",")})`
                        : ""
                }`,
            );
        } else if (key.ctrl && key.name === "c") {
            for (const s of shards.shards.values()) {
                s.kill();
            }

            process.exit();
        }
    });
    ["SIGINT", "SIGUSR1", "SIGUSR2"].map((e) =>
        process.on(e, () => {
            for (const s of shards.shards.values()) {
                s.kill();
            }

            process.exit();
        }),
    );

    await shards.spawn({ amount: "auto" });

    log(`Spawned shards. Press CTRL+R to respawn them`);
}
