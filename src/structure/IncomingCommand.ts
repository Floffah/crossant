import { APIInteractionGuildMember } from "discord-api-types";
import {
    BufferResolvable,
    Channel,
    Collection,
    CommandInteraction,
    CommandInteractionOption,
    FileOptions,
    Guild,
    GuildMember,
    MessageAttachment,
    MessageEmbed,
    User,
} from "discord.js";
import Bot from "../bot/Bot";
import Command from "./Command";
import { Stream } from "stream";

export interface IncomingCommandOpts {
    bot: Bot;
    rawInteraction?: CommandInteraction;
    command: Command;
    deferred?: boolean;
}

export interface IncomingCommandMessageOptions {
    debug?: { [k: string]: string | number | boolean };
    embeds?: MessageEmbed[];
    files?: (FileOptions | BufferResolvable | Stream | MessageAttachment)[];
}

export default class IncomingCommand {
    rawInteraction?: CommandInteraction;
    guild?: Guild;
    channel: Channel;
    user: User;
    member?: GuildMember;
    bot: Bot;
    options: Collection<string, CommandInteractionOption>;
    command: Command;
    deferred?: boolean;

    constructor(i: IncomingCommandOpts) {
        this.bot = i.bot;
        this.command = i.command;
        if (i.rawInteraction) {
            this.rawInteraction = i.rawInteraction;
            if (this.rawInteraction.guild)
                this.guild = this.rawInteraction.guild;
            this.user = this.rawInteraction.user;
            if (this.rawInteraction.member) {
                if (
                    !Object.prototype.hasOwnProperty.call(
                        this.rawInteraction.member,
                        "bannable",
                    ) &&
                    this.guild
                ) {
                    this.rawInteraction.member = this.rawInteraction
                        .member as APIInteractionGuildMember;
                    const found = this.guild.members.resolve(
                        this.rawInteraction.user.id,
                    );
                    if (found) this.member = found;
                } else if (
                    Object.prototype.hasOwnProperty.call(
                        this.rawInteraction.member,
                        "bannable",
                    )
                ) {
                    this.rawInteraction.member = this.rawInteraction
                        .member as GuildMember;
                    this.member = this.rawInteraction.member;
                }
            }
            this.options = this.rawInteraction.options;
            this.channel = this.rawInteraction.channel;
            this.deferred = i.deferred;
        }
    }

    async reply(content?: string, opts: IncomingCommandMessageOptions = {}) {
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
            if (this.deferred) {
                return await this.rawInteraction.editReply({
                    content: c,
                    embeds: opts.embeds,
                    files: opts.files,
                });
            } else {
                return await this.rawInteraction.reply({
                    content: c,
                    embeds: opts.embeds,
                    files: opts.files,
                });
            }
        }
    }

    async reject(reason: string, options: IncomingCommandMessageOptions = {}) {
        return await this.reply("Command rejected: " + reason, options);
    }
}
