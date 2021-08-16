import { GuildResolvable } from "discord.js";
import { ManagerNames } from "src/managers/commands/managers";
import Manager from "src/managers/Manager";
import ManagersManager from "src/managers/ManagersManager";

export default class CacheManager extends Manager {
    prefixes: { [k: string]: string | number } = {}; // snowflake -> prefix/last check returned none

    constructor(m: ManagersManager) {
        super(m, ManagerNames.CacheManager);

        this.managers.on("load", () => this.load());
    }

    async load() {
        //
    }

    async getOrFetchGuildPrefix(guild: GuildResolvable): Promise<string> {
        const g = this.managers.bot.client.guilds.resolve(guild);
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

        if (!dbguild) return this.managers.bot.config.bot.defaultPrefix;

        this.prefixes[g.id] = dbguild.prefix;
        return dbguild.prefix;
    }
}
