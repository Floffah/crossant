import { SettingType } from "@prisma/client";
import { PermissionString, Snowflake } from "discord.js";

export interface GuildSettingInfo<Type extends SettingType> {
    defaultValue?: SettingTypesMap[Type];
    type: Type;
    arrayType?: boolean;
    description: string;
    permission?: PermissionString;
}

export interface SettingTypesMap {
    [SettingType.BOOLEAN]: boolean;
    [SettingType.NUMBER]: number;
    [SettingType.STRING]: string;
    [SettingType.CHANNEL]: Snowflake;
    [SettingType.USER]: Snowflake;
    [SettingType.ROLE]: Snowflake;
}

export const settingParsers = {
    [SettingType.BOOLEAN]: (str: string) => {
        str = str.toLowerCase();
        return str === "y" || str === "yes" || str === "true";
    },
    [SettingType.NUMBER]: parseFloat,
    [SettingType.STRING]: (str: string) => str,
    [SettingType.CHANNEL]: (str: string) => str,
    [SettingType.USER]: (str: string) => str,
    [SettingType.ROLE]: (str: string) => str,
};

export const guildSettingNames = {
    // pingMessage
    PingMessageEnabled: "pingMessage.enabled",
    PingMessageBlacklist: "pingMessage.blacklist",
};

export const guildSettings: {
    [k: string]: GuildSettingInfo<
        "BOOLEAN" | "STRING" | "NUMBER" | "CHANNEL" | "ROLE" | "USER"
    >;
} = {
    [guildSettingNames.PingMessageEnabled]: {
        defaultValue: true,
        type: SettingType.BOOLEAN,
        description:
            "When enabled, allows members of your server to use /pingmsg to send a message when someone pings them.",
        permission: "MANAGE_MESSAGES",
    },
    [guildSettingNames.PingMessageBlacklist]: {
        type: SettingType.STRING,
        arrayType: true,
        description: "An array of words that cannot be used in a ping message",
        permission: "MANAGE_MESSAGES",
    },
};
