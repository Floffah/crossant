import { ShardingManager } from "discord.js";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";
import { parse } from "ini";
import chalk from "chalk";

const keypress = require("keypress");

export async function startShards() {
    console.log(chalk`{red !}{magenta manager} Starting shards`);

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
        console.log(chalk`{red !}{magenta manager} Shard ${shard.id} created`);
    });

    keypress(process.stdin);
    process.stdin.on("keypress", async (_s, key) => {
        if (key.ctrl && key.name === "r") {
            console.log(chalk`{red !}{magenta manager} Respawning all shards`);
            const which = await shards.respawnAll();
            console.log(
                chalk`{red !}{magenta manager} Respawned ${
                    which.size
                } shards (${[...which.keys()].join(", ")})`,
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

    console.log(
        chalk`{red !}{magenta manager} Spawned shards. Press CTRL+R to respawn them`,
    );
}
