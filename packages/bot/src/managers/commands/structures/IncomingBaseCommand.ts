import {
    CategoryChannel,
    CommandInteractionOptionResolver,
    DMChannel,
    Guild,
    GuildMember,
    Interaction,
    NewsChannel,
    PartialDMChannel,
    StageChannel,
    StoreChannel,
    TextChannel,
    ThreadChannel,
    User,
} from "discord.js";
import ManagersManager from "../../ManagersManager";
import BaseCommand, { CommandType } from "./BaseCommand";
import SlashCommand from "./SlashCommand";

export default class IncomingBaseCommand<
    Type extends CommandType = any,
    IsInteraction extends boolean = any,
    IsGuild extends boolean = any,
> {
    managers: ManagersManager;

    interaction: Type extends CommandType.CHAT_INPUT
        ? IsInteraction extends true
            ? Interaction
            : undefined
        : Interaction;

    guild: IsGuild extends true ? Guild : undefined;
    member: IsGuild extends true ? GuildMember : undefined;

    user: User;

    channel: IsGuild extends true
        ?
              | TextChannel
              | CategoryChannel
              | NewsChannel
              | StoreChannel
              | StageChannel
              | ThreadChannel
        : DMChannel | PartialDMChannel;
    // message: Type extends CommandType.USER ? undefined : Message;

    options: CommandInteractionOptionResolver;

    command: Type extends CommandType.CHAT_INPUT ? SlashCommand : BaseCommand;

    hasInteraction: IsInteraction;
    hasGuild: IsGuild;
    type: Type;
}
