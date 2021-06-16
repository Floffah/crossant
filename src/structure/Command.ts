import { ApplicationCommandData, ApplicationCommandOption } from "discord.js";
import Module from "./Module";
import IncomingCommand from "./IncomingCommand";

export default class Command {
    name: string;
    description: string;
    options?: ApplicationCommandOption[];
    module: Module;
    long: boolean;
    isPublic: boolean;

    constructor(
        name: string,
        description: string,
        options?: ApplicationCommandOption[],
        long = true,
        isPublic = true,
    ) {
        this.name = name;
        this.description = description;
        this.options = options;
        this.long = long;
        this.isPublic = isPublic;
    }

    async get(): Promise<ApplicationCommandData> {
        return {
            name: this.name,
            description: this.description,
            options: this.options,
        };
    }

    incoming(_i: IncomingCommand) {
        this.module.bot.logger.err(true, "not implemented");
    }
}
