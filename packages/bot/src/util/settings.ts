import { SettingType } from "@prisma/client";
import { Snowflake } from "discord.js";

export interface GuildSettingInfo<Type extends SettingType> {
    defaultValue: SettingTypesMap[Type];
    type: Type;
}

export interface SettingTypesMap {
    [SettingType.BOOLEAN]: boolean;
    [SettingType.NUMBER]: number;
    [SettingType.STRING]: string;
    [SettingType.CHANNEL]: Snowflake;
    [SettingType.USER]: Snowflake;
    [SettingType.ROLE]: Snowflake;
}

export const guildSettings: {
    [k: string]: GuildSettingInfo<
        "BOOLEAN" | "STRING" | "NUMBER" | "CHANNEL" | "ROLE" | "USER"
    >;
} = {
    "pingMessage.enabled": {
        defaultValue: true,
        type: SettingType.BOOLEAN,
    },
};
