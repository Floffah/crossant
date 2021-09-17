import GuildManager from "src/managers/guilds/GuildManager";
import CommandsManager from "src/managers/commands/CommandsManager";
import VerificationManager from "src/managers/verification/VerificationManager";

export enum ManagerNames {
    GuildManager = "cache",
    CommandsManager = "commands",
    VerificationManager = "verification",
}

export interface ManagerTypes {
    [ManagerNames.GuildManager]: GuildManager;
    [ManagerNames.CommandsManager]: CommandsManager;
    [ManagerNames.VerificationManager]: VerificationManager;
}
