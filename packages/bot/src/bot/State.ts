import Bot from "./Bot";
import { Message, Snowflake, TextChannel, User } from "discord.js";
import { resolve } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { stringify, parse } from "flatted";

export interface StateContent {
    rebooted?: {
        did: boolean;
        triggerer: string; // author of reboot trigger message
        channel: Snowflake;
        message: Snowflake; // the message that the bot replied with about a reboot starting
        started: number;
    };
    pull?: boolean;
}

export default class State {
    bot: Bot;
    state: StateContent = {};
    datapath = resolve(__dirname, "../../../../", "data");
    path = resolve(this.datapath, "state.json");

    constructor(bot: Bot) {
        this.bot = bot;

        this.bot.on("ready", async () => await this.ready());
    }

    async ready() {
        if (!existsSync(this.datapath))
            mkdirSync(this.datapath, { recursive: true });

        this.state = parse(readFileSync(this.path, "utf-8"));

        if (this.state.rebooted && this.state.rebooted.did) {
            this.state.rebooted.did = false;

            const channel = await this.bot.channels.fetch(
                this.state.rebooted.channel,
            );
            if (channel && channel instanceof TextChannel) {
                const message = await channel.messages.fetch(
                    this.state.rebooted.message,
                );

                if (message) {
                    await message.reply(
                        `<@${this.state.rebooted.triggerer}>, rebooted in ${
                            Date.now() - this.state.rebooted.started
                        }ms`,
                    );
                }
            }
        }

        await this.resetState();
    }

    async resetState() {
        this.state = {};

        writeFileSync(this.path, stringify(this.state));
    }

    async noteReboot(author: User, message: Message) {
        this.state.rebooted = {
            did: true,
            triggerer: author.id,
            channel: message.channel.id,
            message: message.id,
            started: Date.now(),
        };

        writeFileSync(this.path, stringify(this.state));
    }

    async notePull() {
        this.state.pull = true;

        writeFileSync(this.path, stringify(this.state));
    }
}
