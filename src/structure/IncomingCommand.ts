import {
    Channel,
    CommandInteraction,
    CommandInteractionOption,
    Guild,
    GuildMember,
    MessageEmbed,
    User,
} from "discord.js";
import Bot from "../bot/Bot";
import Command from "./Command";

export interface IncomingCommandOpts {
    bot: Bot;
    rawInteraction?: CommandInteraction;
    command: Command;
}

export interface IncomingCommandMessageOptions {
    debug?: { [k: string]: string | number | boolean };
}

export default class IncomingCommand {
    rawInteraction?: CommandInteraction;
    guild?: Guild;
    channel?: Channel;
    user?: User;
    member?: GuildMember;
    bot: Bot;
    options: CommandInteractionOption[];
    command: Command;

    constructor(i: IncomingCommandOpts) {
        this.bot = i.bot;
        this.command = i.command;
        if (i.rawInteraction) {
            this.rawInteraction = i.rawInteraction;
            if (this.rawInteraction.guild)
                this.guild = this.rawInteraction.guild;
            if (this.rawInteraction.user) this.user = this.rawInteraction.user;
            if (this.rawInteraction.member)
                this.member = this.rawInteraction.member;
            if (this.rawInteraction.options)
                this.options = this.rawInteraction.options;
            if (this.rawInteraction.channel)
                this.channel = this.rawInteraction.channel;
        }
    }

    async reply(
        content: string | MessageEmbed,
        opts: IncomingCommandMessageOptions = {},
    ) {
        let c = content;
        if (opts.debug && this.bot.state.debug) {
            let debug = "";
            for (const key of Object.keys(opts.debug)) {
                debug += `**${key}**=*${opts.debug[key]}*  `;
            }
            c += "\n" + debug;
        }
        if (
            this.rawInteraction &&
            this.rawInteraction.isCommand() &&
            this.rawInteraction.command
        ) {
            return await this.rawInteraction.reply(c);
        }
    }

    async reject(reason: string, options: IncomingCommandMessageOptions = {}) {
        return await this.reply("Command rejected: " + reason, options);
    }
}
