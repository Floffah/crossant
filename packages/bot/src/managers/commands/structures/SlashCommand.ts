import {
    SlashCommandBuilder,
    ToAPIApplicationCommandOptions,
} from "@discordjs/builders";
import BaseCommand, { BaseCommandOptions, CommandType } from "./BaseCommand";
import IncomingSlashCommand from "./IncomingSlashCommand";

export interface SlashCommandOptions extends Partial<BaseCommandOptions> {
    aliases?: string[];
}

export enum SlashCommandType {
    INTERACTION,
    SIMULATED,
}

export default abstract class SlashCommand extends BaseCommand<true> {
    rawbuilder?: SlashCommandBuilder;
    options?: ToAPIApplicationCommandOptions[];
    opts: SlashCommandOptions;

    protected constructor(
        name: string,
        description: string,
        options?: (builder: SlashCommandBuilder) => any | void,
        opts?: SlashCommandOptions,
    ) {
        super(CommandType.CHAT_INPUT, name, {
            ...opts,
            description,
        });

        if (options) {
            const builder = new SlashCommandBuilder()
                .setName(name)
                .setDescription(description);

            options(builder);

            this.options = builder.options;
            this.rawbuilder = builder;
        }

        this.opts = opts ?? this.baseopts;
        this.aliases = opts?.aliases ?? [];
    }

    abstract incoming(i: IncomingSlashCommand): void | Promise<void>;
}
