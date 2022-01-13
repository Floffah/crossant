import { If } from "src/util/types/utils";
import IncomingBaseCommand from "./IncomingBaseCommand";
import Module from "./Module";

export interface BaseCommandOptions {
    description: string;
    /**
     *  effectively private to executor
     */
    ephemeral?: boolean;
    /**
     * longer reply time. dont need this if command is ephemeral
     */
    deferred?: boolean;
}

export enum CommandType {
    CHAT_INPUT = "slash",
    USER = "user",
    MESSAGE = "guild",
}

export type CommandName = `${CommandType}@${string}`;

export default abstract class BaseCommand<Aliasable extends boolean = boolean> {
    type: CommandType;
    name: string;
    realname: CommandName;
    baseopts: BaseCommandOptions;

    module: Module;
    aliases: If<Aliasable, string[]>;

    protected constructor(
        type: CommandType,
        name: string,
        opts: BaseCommandOptions,
    ) {
        this.type = type;
        this.name = name;
        this.realname = `${type}@${name}`;
        this.baseopts = opts;
    }

    abstract incoming(i: IncomingBaseCommand): void | Promise<void>;
}
