import { APIInteractionGuildMember, APIMessage } from "discord-api-types/v9";
import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    GuildMember,
    Message,
    MessageOptions,
} from "discord.js";
import ManagersManager from "src/managers/common/ManagersManager";
import { CommandType } from "./BaseCommand";
import IncomingBaseCommand from "./IncomingBaseCommand";
import SlashCommand, { SlashCommandType } from "./SlashCommand";

export interface IncomingSlashCommandOptions<
    Type extends SlashCommandType = SlashCommandType,
> {
    managers: ManagersManager;
    command: SlashCommand;

    interaction: Type extends SlashCommandType.SIMULATED
        ? undefined
        : CommandInteraction;

    deferredMessage: Type extends SlashCommandType.SIMULATED
        ? Message | undefined
        : undefined;
    originalMessage: Type extends SlashCommandType.SIMULATED
        ? Message
        : undefined;
    simulatedOptions: Type extends SlashCommandType.SIMULATED
        ? CommandInteractionOptionResolver
        : undefined;
}

export default class IncomingSlashCommand<
    Type extends SlashCommandType = SlashCommandType,
> extends IncomingBaseCommand<CommandType.CHAT_INPUT> {
    interaction: Type extends SlashCommandType.SIMULATED
        ? undefined
        : CommandInteraction;

    message: Type extends SlashCommandType.SIMULATED ? Message : undefined;

    commandType: Type;

    private lastSimulatedMessage?: Message;
    private previouslySimulated = false;
    private deleteSimulatedTimeout?: NodeJS.Timeout;

    constructor(opts: IncomingSlashCommandOptions<Type>) {
        super();
        this.type = CommandType.CHAT_INPUT;

        this.managers = opts.managers;
        this.command = opts.command;

        this.interaction = opts.interaction;

        this.lastSimulatedMessage = opts.deferredMessage;
        this.previouslySimulated = !!opts.deferredMessage;

        if (opts.interaction) {
            this.hasInteraction = true;
            this.commandType = SlashCommandType.INTERACTION as Type;

            this.guild = opts.interaction.guild ?? undefined;

            if (opts.interaction.guild && opts.interaction.member) {
                let member: GuildMember | APIInteractionGuildMember | null =
                    opts.interaction.member;

                if (!(member instanceof GuildMember))
                    member = opts.interaction.guild.members.resolve(
                        opts.interaction.member.user.id,
                    );

                this.member = member as GuildMember; // it has to be a guild member at this point typescript is just stupid sometimes
                this.guild = opts.interaction.guild;
                this.hasGuild = true;
            } else {
                this.hasGuild = false;
            }

            this.user = opts.interaction.user;

            if (!opts.interaction.channel)
                throw new Error("No channel... what?"); // how do you send a slash command if not sending it in a channel... why can this be null discord.js HMMMMM?
            this.channel = opts.interaction.channel;

            this.options = opts.interaction.options;
        } else {
            this.hasInteraction = false;
            this.commandType = SlashCommandType.SIMULATED as Type;

            if (!opts.originalMessage) throw new Error("No message passed");
            this.message = opts.originalMessage;

            if (opts.originalMessage.guild && opts.originalMessage.member) {
                this.hasGuild = true;
                this.member = opts.originalMessage.member;
                this.guild = opts.originalMessage.guild;
            } else {
                this.hasGuild = false;
            }

            this.user = opts.originalMessage.author;
            this.channel = opts.originalMessage.channel;

            this.options =
                opts.simulatedOptions as CommandInteractionOptionResolver; // should be defined if no interaction
        }
    }

    async reply(content: string | Omit<MessageOptions, "reply">) {
        if (
            this.commandType === SlashCommandType.INTERACTION &&
            this.interaction
        ) {
            if (this.previouslySimulated) {
                return await this.interaction.editReply(content);
            } else {
                this.previouslySimulated = true;
                return await this.interaction.reply(
                    typeof content === "string"
                        ? { content, fetchReply: true }
                        : { ...content, fetchReply: true },
                );
            }
        } else {
            let message: Message | APIMessage;
            if (this.lastSimulatedMessage && this.previouslySimulated) {
                message = await this.lastSimulatedMessage.edit(content);
            } else if (this.message) {
                message = this.lastSimulatedMessage = await this.message.reply(
                    content,
                );
            } else {
                throw new Error("Nothing to reply to");
            }

            if (this.command.opts?.ephemeral && this.lastSimulatedMessage)
                this.safelyDeleteSimulated();

            return message;
        }
    }

    async editReply(content: string | Omit<MessageOptions, "reply">) {
        if (
            this.commandType === SlashCommandType.INTERACTION &&
            this.interaction
        ) {
            return await this.interaction.editReply(content);
        } else if (this.lastSimulatedMessage && this.previouslySimulated) {
            const message = await this.lastSimulatedMessage.edit(content);
            this.safelyDeleteSimulated();
            return message;
        } else throw "No message to edit";
    }

    async deleteReply() {
        if (
            this.commandType === SlashCommandType.INTERACTION &&
            this.interaction
        ) {
            await this.interaction.deleteReply();
        } else if (this.lastSimulatedMessage) {
            if (this.deleteSimulatedTimeout)
                clearTimeout(this.deleteSimulatedTimeout);
            await this.lastSimulatedMessage.delete();
        }
    }

    safelyDeleteSimulated() {
        if (this.deleteSimulatedTimeout)
            clearTimeout(this.deleteSimulatedTimeout);
        this.deleteSimulatedTimeout = setTimeout(async () => {
            if (
                this.lastSimulatedMessage &&
                this.lastSimulatedMessage.deletable
            ) {
                await this.lastSimulatedMessage.delete();
                this.lastSimulatedMessage = undefined;
            }
        }, 5000);
    }
}
