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
import { If } from "src/util/types";
import ManagersManager from "../../ManagersManager";
import BaseCommand, { CommandType } from "./BaseCommand";
import SlashCommand from "./SlashCommand";

export default class IncomingBaseCommand<
    Type extends CommandType = CommandType,
    IsInteraction extends boolean = boolean,
    IsGuild extends boolean = boolean,
> {
    managers: ManagersManager;

    interaction: Type extends CommandType.CHAT_INPUT
        ? If<IsInteraction, Interaction>
        : Interaction;

    guild: If<IsGuild, Guild>;
    member: If<IsGuild, GuildMember>;

    user: User;

    channel: If<
        IsGuild,
        | TextChannel
        | CategoryChannel
        | NewsChannel
        | StoreChannel
        | StageChannel
        | ThreadChannel,
        DMChannel | PartialDMChannel
    >;
    // message: Type extends CommandType.USER ? undefined : Message;

    options: CommandInteractionOptionResolver;

    command: Type extends CommandType.CHAT_INPUT ? SlashCommand : BaseCommand;

    hasInteraction: IsInteraction;
    hasGuild: IsGuild;
    type: Type;
}
