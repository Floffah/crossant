import CacheManager from "src/managers/commands/CacheManager";
import CommandsManager from "src/managers/commands/CommandsManager";

export enum ManagerNames {
    CacheManager = "cache",
    CommandsManager = "commands",
}

export interface ManagerTypes {
    [ManagerNames.CacheManager]: CacheManager;
    [ManagerNames.CommandsManager]: CommandsManager;
}
