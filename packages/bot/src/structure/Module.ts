import Bot from "../bot/Bot";
import Command from "./Command";

export default class Module {
    commands: string[] = [];

    name: string;
    bot: Bot;

    constructor(name: string) {
        this.name = name;
    }

    registerCommand(c: Command) {
        this.bot.registerCommand(this, c);
    }

    load() {
        this.bot.logger.err(
            process.argv.includes("--trace"),
            "not implemented",
        );
    }

    ready() {
        this.bot.logger.err(
            process.argv.includes("--trace"),
            "not implemented",
        );
    }
}
