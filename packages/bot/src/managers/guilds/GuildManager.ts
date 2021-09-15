import { GuildSetting, Prisma, SettingType } from "@prisma/client";
import {
    Guild,
    GuildChannel,
    GuildMember,
    GuildResolvable,
    Role,
} from "discord.js";
import { ManagerNames } from "src/managers/common/managers";
import Manager from "src/managers/common/Manager";
import ManagersManager from "src/managers/common/ManagersManager";
import {
    guildSettingNames,
    guildSettings,
    SettingTypesMap,
} from "src/settings/settings";
import { ValueOf } from "src/util/types/utils";

export default class GuildManager extends Manager {
    prefixes: { [k: string]: string | number } = {}; // snowflake -> prefix/last check returned none

    constructor(m: ManagersManager) {
        super(m, ManagerNames.GuildManager);

        this.managers.on("load", () => this.load());
    }

    async load() {
        //
    }

    async getOrFetchGuildPrefix(guild: GuildResolvable): Promise<string> {
        const g =
            (guild instanceof Guild
                ? guild
                : this.managers.bot.client.guilds.resolve(guild)) ??
            (typeof guild === "string"
                ? await this.managers.bot.client.guilds.fetch(guild)
                : null);
        if (!g) return this.managers.bot.config.bot.defaultPrefix;

        if (Object.prototype.hasOwnProperty.call(this.prefixes, g.id)) {
            if (typeof this.prefixes[g.id] === "string")
                return this.prefixes[g.id] as string;
            else if (
                Date.now() - (this.prefixes[g.id] as number) <
                1000 * 60 * 5
            )
                return this.managers.bot.config.bot.defaultPrefix;
        }

        const dbguild = await this.managers.bot.db.guild.findUnique({
            where: {
                id: g.id,
            },
        });

        if (!dbguild) {
            this.prefixes[g.id] = Date.now();
            return this.managers.bot.config.bot.defaultPrefix;
        }

        this.prefixes[g.id] = dbguild.prefix;
        return dbguild.prefix;
    }

    async getFullSetting(
        guild: GuildResolvable,
        name: string,
    ): Promise<
        | {
              setting: GuildSetting;
              value:
                  | SettingTypesMap[SettingType]
                  | SettingTypesMap[SettingType][];
              guild: Guild;
          }
        | undefined
    > {
        const g =
            (guild instanceof Guild
                ? guild
                : this.managers.bot.client.guilds.resolve(guild)) ??
            (typeof guild === "string"
                ? await this.managers.bot.client.guilds.fetch(guild)
                : null);
        if (!g) throw "No such guild";

        const setting = await this.managers.bot.db.guildSetting.findUnique({
            where: {
                guildId_name: {
                    guildId: g.id,
                    name,
                },
            },
        });

        if (!setting) return undefined;

        const value = setting.value as Prisma.JsonObject | Prisma.JsonArray;

        return {
            setting,
            value: ("values" in value ? value.values : value.value) as
                | SettingTypesMap[SettingType]
                | SettingTypesMap[SettingType][],
            guild: g,
        };
    }

    async setSetting(
        guild: GuildResolvable,
        name: string,
        value: SettingTypesMap[SettingType] | SettingTypesMap[SettingType][],
        overrideType?: SettingType,
    ) {
        const g =
            (guild instanceof Guild
                ? guild
                : this.managers.bot.client.guilds.resolve(guild)) ??
            (typeof guild === "string"
                ? await this.managers.bot.client.guilds.fetch(guild)
                : null);
        if (!g) throw "No such guild";

        let type: SettingType = overrideType ?? SettingType.STRING;

        if (!overrideType) {
            if (typeof value === "string") type = SettingType.STRING;
            else if (typeof value === "number") type = SettingType.NUMBER;
            else if (typeof value === "boolean") type = SettingType.BOOLEAN;
            else throw "Must override the type when passing a snowflake";
        }

        await this.managers.bot.db.guildSetting.upsert({
            where: {
                guildId_name: {
                    guildId: g.id,
                    name,
                },
            },
            create: {
                guild: {
                    connectOrCreate: {
                        where: {
                            id: g.id,
                        },
                        create: {
                            id: g.id,
                        },
                    },
                },
                type,
                value: { value },
                name,
                arrayType: Array.isArray(value),
            },
            update: {
                value: { value },
                type,
                arrayType: Array.isArray(value),
            },
        });
    }

    async getBasicSetting<Type extends SettingType>(
        guild: GuildResolvable,
        name: ValueOf<typeof guildSettingNames>,
        type?: Type,
    ): Promise<
        boolean | string | number | (boolean | string | number)[] | undefined
    > {
        if (!type && name in guildSettings)
            type = guildSettings[name].type as Type;

        const setting = await this.getFullSetting(guild, name);
        if (!setting) {
            if (name in guildSettings) {
                const s = guildSettings[name];
                if (typeof s.defaultValue !== "undefined" && s.type === type)
                    return s.defaultValue as SettingTypesMap[Type];
                else return undefined;
            } else return undefined;
        }
        if (!setting || !setting.value) return undefined;

        if (
            setting.setting.type !== SettingType.STRING &&
            setting.setting.type !== SettingType.NUMBER &&
            setting.setting.type !== SettingType.BOOLEAN
        )
            return undefined;

        return setting.value;
    }

    async getFancySetting<Type extends SettingType>(
        guild: GuildResolvable,
        name: keyof typeof guildSettingNames,
        type: Type,
    ) {
        const setting = await this.getFullSetting(guild, name);
        // cannot have a default
        if (
            !setting ||
            !setting.value ||
            (typeof setting.value !== "string" && !Array.isArray(setting.value))
        )
            return undefined;

        if (Array.isArray(setting.value)) {
            const final: (Role | GuildMember | GuildChannel | undefined)[] = [];

            for (const entry of setting.value) {
                if (typeof entry !== "string") {
                    final.push(undefined);
                    continue;
                }
                if (type === SettingType.CHANNEL) {
                    const found = await this.managers.bot.client.channels.fetch(
                        entry,
                    );
                    if (!(found instanceof GuildChannel)) return undefined;

                    final.push(found);
                } else if (type === SettingType.USER) {
                    final.push(await setting.guild.members.fetch(entry));
                } else if (type === SettingType.ROLE) {
                    const found = await setting.guild.roles.fetch(entry);
                    if (!found) return undefined;
                    final.push(found);
                } else final.push(undefined);
            }

            return final;
        } else {
            let final: Role | GuildMember | GuildChannel | undefined =
                undefined;

            if (type === SettingType.CHANNEL) {
                const found = await this.managers.bot.client.channels.fetch(
                    setting.value,
                );
                if (!(found instanceof GuildChannel)) return undefined;

                final = found;
            } else if (type === SettingType.USER) {
                final = await setting.guild.members.fetch(setting.value);
            } else if (type === SettingType.ROLE) {
                const found = await setting.guild.roles.fetch(setting.value);
                if (!found) return undefined;
                final = found;
            }

            return final;
        }
    }
}
