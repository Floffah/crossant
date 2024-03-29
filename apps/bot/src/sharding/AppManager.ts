import pm2 from "@pm2/io";
import { captureException, init, Integrations } from "@sentry/node";
import axios from "axios";
import chalk from "chalk";
import { Shard, ShardingManager, TextChannel } from "discord.js";
import execa, { execaCommandSync } from "execa";
import { parse as flattedParse, stringify as flattedStringify } from "flatted";
import * as fs from "fs";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { parse, stringify } from "ini";
import git from "isomorphic-git";
import { parse as jjuParse } from "jju";
import { DateTime } from "luxon";
import { resolve } from "path";
import pluralize from "pluralize";
import semver from "semver/preload";
import { Config } from "src/config/config";
import { ShardCache } from "src/sharding/shardcache";
import { ShardMessage } from "src/sharding/shardmessages";
import { getMoreRecentlyEdited } from "src/util/files/info";
import { defaultEmbed } from "src/util/messages/embeds";

const keypress = require("keypress");

const processmode = true; // YES I KNOW THIS IS VERY EXPENSIVE but the node i use can handle it and workers cannot be used until node-canvas supports worker threads!

export default class AppManager {
    datadir = resolve(process.cwd(), ".crossant");
    configpath = resolve(this.datadir, "config.ini");
    config: Config;
    cachepath = resolve(this.datadir, "amcache.json");
    cache: ShardCache;

    debugmode?: boolean;
    checkingForUpdates = false;

    metrics: {
        respawning: ReturnType<typeof pm2.metric>;
        totalShards: ReturnType<typeof pm2.metric>;
        updating: ReturnType<typeof pm2.metric>;
    };
    pm2: ReturnType<typeof pm2.init>;

    shards: ShardingManager;

    doSentry = false;

    readConfig() {
        this.config = parse(readFileSync(this.configpath, "utf-8")) as Config;
    }

    writeConfig() {
        writeFileSync(this.configpath, stringify(this.config));
    }

    readCache() {
        this.cache = flattedParse(
            readFileSync(this.cachepath, "utf-8"),
        ) as ShardCache;
    }

    writeCache() {
        writeFileSync(this.cachepath, flattedStringify(this.cache));
    }

    async init(opts: { debug?: boolean }) {
        this.debugmode = opts.debug;

        if (!existsSync(this.datadir)) {
            console.error(
                chalk`{red Could not find crossant's data dir (.crossant). Please check your working directory}`,
            );
            process.exit(1);
        }

        this.readConfig();

        if (!existsSync(this.cachepath)) {
            this.cache = {};
            this.writeCache();
        }

        this.readCache();

        this.pm2 = pm2.init({
            metrics: {
                network: true,
                http: true,
                eventLoop: true,
                v8: true,
                runtime: true,
            },
            profiling: true,
            tracing: true,
        });

        this.metrics = {
            respawning: this.pm2.metric({ name: "Respawning" }),
            totalShards: this.pm2.metric({
                name: "Total shards",
                unit: " shards",
            }),
            updating: this.pm2.metric({ name: "Checking for updates" }),
        };
        this.metrics.respawning.set(false);

        if (this.config.sentry && !this.debugmode) {
            try {
                this.doSentry = true;

                await this.updateSentryRelease();

                init({
                    dsn: this.config.sentry.dsn,
                    tracesSampleRate: 1,
                    environment:
                        (processmode ? "appmanager-" : "fullstack") +
                        (this.debugmode ? "development" : "production"),
                    integrations: [
                        new Integrations.OnUncaughtException(),
                        new Integrations.OnUnhandledRejection(),
                    ],
                    // release: require("../../package.json").version,
                });

                this.log("Initialised sentry");
            } catch (e) {
                console.error(e);
                this.log(
                    "There was a problem while updating sentry commits and initialising sentry",
                    true,
                );
                this.doSentry = false;
            }
        }

        this.log("Starting shards");
        process.env.SHARD_TIME = `${Date.now()}`;

        if (processmode) process.env.SHARDPROCESSMODE = "true";

        this.shards = new ShardingManager(resolve(__dirname, "rawstart.js"), {
            totalShards: "auto",
            mode: processmode ? "process" : "worker",
            token: this.config.bot.token,
            respawn: true,
        });
        this.metrics.totalShards.set(this.shards.shards.size);

        this.shards.on("shardCreate", (s) => this.shardCreate(s));

        keypress(process.stdin);
        process.stdin.on("keypress", async (_s, key) => {
            if (key.ctrl && key.name === "r") await this.respawnShards();
            else if (key.ctrl && key.name === "c") await this.dispose();
        });

        ["SIGINT", "SIGUSR1", "SIGUSR2"].map((e) =>
            process.on(e, () => this.dispose()),
        );

        await this.shards.spawn({ amount: "auto" });
        this.log("Spawned shards. Press CTRL+R to respawn them");

        pm2.action("Check for updates", undefined, () =>
            this.checkForUpdates(),
        );

        await this.broadcastLog("Bot started");

        await this.checkForUpdates();

        setInterval(() => {
            this.checkForUpdates();
        }, 1000 * 60 * 5);
    }

    async updateSentryRelease() {
        if (this.config.sentry && !this.debugmode) {
            const lastCommitSha = this.config.sentry?.lastCommit;

            const dir = process.cwd();
            const gitlog = await git.log({
                fs,
                dir,
                since: lastCommitSha
                    ? DateTime.fromMillis(
                          (
                              await git.readCommit({
                                  oid: lastCommitSha,
                                  fs,
                                  dir,
                              })
                          ).commit.author.timestamp,
                          {
                              zone: "utc",
                          },
                      ).toJSDate()
                    : undefined,
            });

            if (gitlog.length > 0) {
                const commits = gitlog.map((log) => ({
                    id: log.oid,
                    repository: "Floffah/crossant",
                }));

                this.config.sentry.lastCommit = commits[0].id;
                this.writeConfig();

                await axios.post(
                    this.config.sentry.releases,
                    {
                        commits,
                        version: commits[0].id,
                        projects: ["crossant-shard"],
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${this.config.sentry.authToken}`,
                        },
                    },
                );
            }
        }
    }

    async shardCreate(shard: Shard) {
        this.log(`Shard ${shard.id} created`);
        this.metrics.totalShards.set(this.shards.shards.size);

        shard.on("message", (m) => this.shardMessage(shard, m));
    }

    async shardMessage(_shard: Shard, message: ShardMessage) {
        if (message.type === "respawn")
            await this.respawnShards(
                message.data?.ids ? message.data.ids : undefined,
            );
        else if (message.type === "check") await this.checkForUpdates();
    }

    async checkForUpdates() {
        if (process.env.NODE_ENV === "development") return;

        this.checkingForUpdates = true;

        this.log("Checking for updates");
        this.metrics.updating.set(true);

        const execopts: execa.SyncOptions<string> = {
            stdio: "pipe",
            cwd: process.cwd(),
            env: process.env,
        };

        // using git because isomorphic-git has no output for pulling (which is necessary)
        const pull = execaCommandSync("git pull", execopts);
        if (`${pull.stdout}`.toLowerCase().includes("already up to date")) {
            this.log("No updates");
            this.checkingForUpdates = false;
            this.metrics.updating.set(false);
            return;
        }

        this.readCache();
        const pkgInfo = jjuParse(
            readFileSync(resolve(process.cwd(), "package.json"), "utf-8"),
        );

        let doPrisma = false;
        let newPrismaTime: number | undefined = undefined;

        if (
            !this.cache.lastPrismaClientVersion ||
            semver.gt(
                pkgInfo.devDependencies["@prisma/client"],
                this.cache.lastPrismaClientVersion,
            )
        )
            doPrisma = true;
        else if (
            !this.cache.lastPrismaCLIVersion ||
            semver.gt(
                pkgInfo.devDependencies.prisma,
                this.cache.lastPrismaCLIVersion,
            )
        )
            doPrisma = true;
        if (!this.cache.lastPrismaUpdate) doPrisma = true;
        else {
            const prismadir = getMoreRecentlyEdited(
                resolve(process.cwd(), "prisma"),
                this.cache.lastPrismaUpdate,
            );
            if (prismadir) {
                doPrisma = true;
                newPrismaTime = prismadir.time;
            }
        }

        if (doPrisma) {
            this.cache.lastPrismaUpdate = newPrismaTime;
            this.cache.lastPrismaClientVersion =
                pkgInfo.devDependencies["@prisma/client"];
            this.cache.lastPrismaCLIVersion = pkgInfo.devDependencies["prisma"];

            this.writeCache();

            for (const s of this.shards.shards.values()) {
                this.log(`Stopping shard ${s.id} to apply updates`);

                try {
                    await this.broadcastLog(
                        `Stopping shard ${s.id} to apply updates`,
                    );
                    if (s.worker || s.process) s.kill();
                } catch (e) {
                    console.error(e);
                    if (this.doSentry) captureException(e);
                }
            }

            this.log("Installing dependencies");
            execaCommandSync("yarn", execopts);

            this.log("Applying database migrations");
            execaCommandSync("yarn prisma migrate deploy", execopts);

            this.log("Generating database client");
            execaCommandSync("yarn prisma generate", execopts);

            this.log("Building code");
            execaCommandSync("yarn workspace crossant tsup --minify", execopts);

            await this.respawnShards(undefined, true);
        } else {
            this.log("Installing dependencies");
            execaCommandSync("yarn", execopts);

            this.log("Skipping database migrate & generate");

            this.log("Building code");
            execaCommandSync("yarn workspace crossant tsup --minify", execopts);

            await this.respawnShards();
        }

        try {
            await this.updateSentryRelease();
        } catch (e) {
            console.error(e);
            await this.broadcastLog(
                `There was a problem while trying to notify sentry of new commits:\n${e.stack}`,
            );
            for (const shard of this.shards.shards) shard[1].kill();
            process.exit();
        }

        // await this.respawnShards();
        this.checkingForUpdates = false;
        this.metrics.updating.set(false);
    }

    async respawnShards(ids?: number[], start = false) {
        this.log("Respawning all shards");

        const which: number[] = [];
        const faults: number[] = [];

        if (!start)
            await this.broadcastLog(
                `Respawning ${ids ? `shards ${ids.join(", ")}` : "all shards"}`,
            );

        this.metrics.respawning.set(true);
        for (const s of this.shards.shards.values()) {
            if (ids && !ids.includes(s.id)) continue;
            try {
                if ((!s.worker && !s.process) || start) await s.spawn();
                else {
                    await this.broadcastLog(`Respawning shard ${s.id}`);
                    await s.respawn();
                }
                which.push(s.id);
                try {
                    await this.broadcastLog(`Respawned shard ${s.id}`);
                } catch (e) {
                    console.error(e);
                    if (this.doSentry) captureException(e);
                }
            } catch (e) {
                if (this.doSentry) captureException(e);
                this.log(`Shard ${s.id} failed to respawn. ${e.message}`, true);
                console.log(e.stack);
                faults.push(s.id);

                if (s.worker || s.process) {
                    try {
                        s.kill();
                    } catch (e2) {
                        if (this.doSentry) captureException(e);
                        //d
                    }
                }
                try {
                    this.shards.createShard(s.id);
                } catch (e2) {
                    if (this.doSentry) captureException(e);
                    // e
                }
                try {
                    await this.broadcastLog(
                        `Failed to respawn shard ${s.id} so i created a new one\n\n${e}`,
                    );
                } catch (e2) {
                    this.log(
                        `Worst case scenario happened, failed to respawn shard ${s.id} and couldn't broadcast an error.`,
                        true,
                    );
                    console.log(e2.stack);
                    if (this.doSentry) captureException(e2);
                    process.exit(0);
                }
            }
        }
        this.metrics.respawning.set(false);

        const msg = `Respawned ${which.length} ${pluralize(
            "shards",
            which.length,
        )} successfully (${[...which.join(",")]}) ${
            faults.length > 0
                ? `with ${faults.length} broken ${pluralize(
                      "shards",
                      faults.length,
                  )} (${faults.join(",")})`
                : ""
        }`;
        this.log(msg);
        try {
            await this.broadcastLog(msg);
        } catch (e) {
            if (this.doSentry) captureException(e);
        }
    }

    async dispose() {
        for (const s of this.shards.shards.values()) {
            try {
                s.kill();
            } catch (e) {
                console.error(e);
                if (this.doSentry) captureException(e);
            }
        }

        process.exit();
    }

    async broadcastLog(msg: string) {
        return await this.shards.broadcastEval(
            async (c, ctx) => {
                // try {
                const channel = (await c.channels.fetch(ctx.channelID)) as
                    | TextChannel
                    | undefined;
                if (channel)
                    await channel.send({
                        embeds: [ctx.embed],
                    });
                // } catch (e) {
                //     console.error(e);
                //     console.log(`Couldn't broadcast:`, msg);
                // }
            },
            {
                context: {
                    channelID:
                        this.config.bot.broadcastLog === "disabled"
                            ? "879415229375717406"
                            : this.config.bot.broadcastLog,
                    embed: defaultEmbed()
                        .setTitle(`Message from AppManager`)
                        .setDescription(msg),
                },
            },
        );
    }

    log(msg: string, err = false) {
        (err ? console.error : console.log)(
            chalk`{red !}{magenta manager} ${msg}`,
        );
    }
}
