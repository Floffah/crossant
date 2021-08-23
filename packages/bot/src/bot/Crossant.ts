import { REST } from "@discordjs/rest";
import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import { Client } from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { parse, stringify } from "ini";
import { resolve } from "path";
import "source-map-support/register";
import ManagersManager from "../managers/ManagersManager";
import { Config } from "../util/config";
import Logger from "../util/Logger";

require("dotenv").config();

export default class Crossant {
    client: Client;
    rest: REST;

    managers: ManagersManager;
    db: PrismaClient;

    datadir = resolve(process.cwd(), ".crossant");
    configpath = resolve(this.datadir, "config.ini");
    config: Config;

    logger: Logger;

    debugmode = process.env.NODE_ENV === "development";

    readyTime: number;
    shardmanstarttime?: number;

    readConfig() {
        this.config = parse(readFileSync(this.configpath, "utf-8")) as Config;
    }

    writeConfig() {
        writeFileSync(this.configpath, stringify(this.config));
    }

    async init(opts: { debug?: boolean }) {
        try {
            const shardtime = process.argv.find((a) =>
                a.toLowerCase().startsWith("--shard_time="),
            );
            if (shardtime)
                this.shardmanstarttime = parseInt(
                    shardtime.toLowerCase().replace("--shard_time=", ""),
                );
            else if ("SHARD_TIME" in process.env && process.env.SHARD_TIME)
                this.shardmanstarttime = parseInt(process.env.SHARD_TIME);

            if (opts.debug) this.debugmode = true;

            this.logger = new Logger();
            this.logger.debugEnabled = this.debugmode;

            // this.logger = createLogger({
            //     levels: {
            //         error: 0,
            //         warn: 1,
            //         info: 2,
            //         debug: 3,
            //     },
            //     level: this.debugmode ? "debug" : "info",
            //     format: format.json(),
            //     transports: [
            //         new transports.Console({
            //             format: format.combine(format.colorize(), format.simple()),
            //         }),
            //     ],
            // });

            this.logger.debug("In debug mode");

            if (!existsSync(this.datadir)) {
                console.error(
                    chalk`{red Could not find crossant's data dir (.crossant). Please check your working directory}`,
                );
                process.exit(1);
            }

            this.readConfig();

            this.client = new Client({
                intents: [
                    "GUILDS",
                    "GUILD_MESSAGES",
                    "GUILD_MEMBERS",
                    "GUILD_EMOJIS_AND_STICKERS",
                    "GUILD_MESSAGE_REACTIONS",
                    "DIRECT_MESSAGES",
                ],
                partials: [
                    "CHANNEL",
                    "GUILD_MEMBER",
                    "MESSAGE",
                    "REACTION",
                    "USER",
                ],
            });

            if (this.client.shard) {
                this.logger.prefix = this.client.shard.ids.join(",");
                this.logger.info(
                    `Sharding enabled. ids: ${this.client.shard.ids.join(
                        ", ",
                    )}`,
                );
            } else this.logger.info("Sharding disabled");

            this.db = new PrismaClient({
                log: this.debugmode
                    ? ["warn", "error", "info", "query"]
                    : ["warn", "error"],
            });

            this.managers = new ManagersManager(this);
            await this.managers.startManagers();

            this.writeConfig();

            this.client.on("ready", () => this.ready());
            this.rest = new REST({ version: "9" }).setToken(
                this.config.bot.token,
            );
            await this.client.login(this.config.bot.token);
        } catch (e) {
            console.error(e);
        }
    }

    async ready() {
        this.readyTime = Date.now();

        await this.updatePresence();

        setInterval(() => this.updatePresence());
    }

    async updatePresence() {
        if (!this.client.shard) return;

        const membersArray = await this.client.shard.broadcastEval(
            async (c) => {
                return c.users.cache.size;
            },
        );
        let total = 0;

        for (const members of membersArray) {
            total += members;
        }

        this.client.user?.setPresence({
            status: "online",
            shardId: this.client.shard.ids,
            activities: [
                {
                    type: "WATCHING",
                    name: `${total} customers`,
                },
            ],
        });
    }
}
