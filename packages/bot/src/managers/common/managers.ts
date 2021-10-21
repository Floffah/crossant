import GuildManager from "src/managers/guilds/GuildManager";
import CommandsManager from "src/managers/commands/CommandsManager";
import IntegrationManager from "src/managers/integrations/IntegrationManager";
import VerificationManager from "src/managers/verification/VerificationManager";

export enum ManagerNames {
    GuildManager = "guilds",
    CommandsManager = "commands",
    VerificationManager = "verification",
    IntegrationManager = "integrations",
}

export interface ManagerTypes {
    [ManagerNames.GuildManager]: GuildManager;
    [ManagerNames.CommandsManager]: CommandsManager;
    [ManagerNames.VerificationManager]: VerificationManager;
    [ManagerNames.IntegrationManager]: IntegrationManager;
}
