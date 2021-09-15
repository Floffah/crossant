import GuildManager from "src/managers/guilds/GuildManager";
import CommandsManager from "src/managers/commands/CommandsManager";

export enum ManagerNames {
    GuildManager = "cache",
    CommandsManager = "commands",
}

export interface ManagerTypes {
    [ManagerNames.GuildManager]: GuildManager;
    [ManagerNames.CommandsManager]: CommandsManager;
}
