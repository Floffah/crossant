import { Client } from "discord.js";
import { resolve } from "path";
import ManagersManager from "../managers/ManagersManager";
import { existsSync, readFileSync, writeFileSync } from "fs";
import chalk from "chalk";
import { Config } from "../util/config";
import { parse, stringify } from "ini";
// import { createLogger, format, Logger, transports } from "winston";
import { PrismaClient } from "@prisma/client";
import Logger from "../util/Logger";

require("dotenv").config();

export default class Crossant {
    client: Client;

    managers: ManagersManager;
    db: PrismaClient;

    datadir = resolve(process.cwd(), ".crossant");
    configpath = resolve(this.datadir, "config.ini");
    config: Config;

    logger: Logger;

    debugmode = process.env.NODE_ENV === "development";

    readConfig() {
        this.config = parse(readFileSync(this.configpath, "utf-8")) as Config;
    }

    writeConfig() {
        writeFileSync(this.configpath, stringify(this.config));
    }

    async init(opts: { debug?: boolean }) {
        if (opts.debug) this.debugmode = true;

        this.logger = new Logger();

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
            intents: ["DIRECT_MESSAGES", "GUILD_MESSAGES", "GUILDS"],
        });

        if (this.client.shard) {
            this.logger.prefix = this.client.shard.ids.join(",");
            this.logger.info(
                `Sharding enabled. ids: ${this.client.shard.ids.join(", ")}`,
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

        await this.client.login(this.config.bot.token);
    }
}
