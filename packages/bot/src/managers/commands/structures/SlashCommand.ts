import BaseCommand, { BaseCommandOptions, CommandType } from "./BaseCommand";
import {
    SlashCommandBuilder,
    ToAPIApplicationCommandOptions,
} from "@discordjs/builders";
import IncomingSlashCommand from "./IncomingSlashCommand";

export interface SlashCommandOptions extends Partial<BaseCommandOptions> {
    aliases?: string[];
}

export enum SlashCommandType {
    INTERACTION,
    SIMULATED,
}

export default abstract class SlashCommand extends BaseCommand<true> {
    options?: ToAPIApplicationCommandOptions[];
    opts: SlashCommandOptions;

    protected constructor(
        name: string,
        description: string,
        options?: (builder: SlashCommandBuilder) => SlashCommandBuilder,
        opts?: SlashCommandOptions,
    ) {
        super(CommandType.CHAT_INPUT, name, {
            ...opts,
            description,
        });

        if (options)
            this.options = options(
                new SlashCommandBuilder()
                    .setName(name)
                    .setDescription(description),
            ).options;

        this.opts = opts ?? this.baseopts;
        this.aliases = opts?.aliases ?? [];
    }

    abstract incoming(i: IncomingSlashCommand): void | Promise<void>;
}
