import { Routes } from "discord-api-types/v9";
import { ApplicationCommandData, Interaction, Message } from "discord.js";
import { ManagerNames } from "src/managers/commands/managers";
import BoardsModule from "src/managers/commands/modules/Boards";
import UtilModule from "src/managers/commands/modules/Util";
import IncomingSlashCommand, {
    IncomingSlashCommandOptions,
} from "src/managers/commands/structures/IncomingSlashCommand";
import Module from "src/managers/commands/structures/Module";
import SlashCommand, {
    SlashCommandType,
} from "src/managers/commands/structures/SlashCommand";
import Manager from "src/managers/Manager";
import ManagersManager from "src/managers/ManagersManager";
import { ApplicationCommandTypes } from "src/util/djs/enums";
import Logger from "src/util/Logger";
import { parseToOptions } from "src/util/options";
import BaseCommand, {
    CommandName,
    CommandType,
} from "./structures/BaseCommand";

export default class CommandsManager extends Manager {
    commands: Map<CommandName, BaseCommand> = new Map();
    aliases: Map<string, CommandName> = new Map();
    modules: Map<string, Module> = new Map();

    initialModules: { new (): Module }[] = [BoardsModule, UtilModule];

    constructor(m: ManagersManager) {
        super(m, ManagerNames.CommandsManager);

        this.managers.on("load", () => this.load());
    }

    async load() {
        for (const module of this.initialModules) {
            const m = new module();
            await this.registerModule(m);
        }

        this.managers.bot.client.on("ready", () => this.ready());
        this.managers.bot.client.on("interactionCreate", (i) =>
            this.interaction(i),
        );
        this.managers.bot.client.on("messageCreate", (m) => this.message(m));
    }

    async registerModule(m: Module) {
        m.managers = this.managers;
        this.modules.set(m.name, m);
        this.managers.bot.logger.debug(`Registered module ${m.name}`);
        if (m.load) await m.load(); // send the load event to the module
    }

    registerCommand(m: Module, c: BaseCommand) {
        c.module = m;
        this.commands.set(c.realname, c);
        m.commands.push(c.name);
        this.managers.bot.logger.debug(
            `Registered command ${c.name} (${c.type})`,
        );
        if (c.aliases && c.aliases.length > 0) {
            for (const alias of c.aliases) {
                this.aliases.set(alias, c.realname);
            }
        }
    }

    async ready() {
        const commands: ApplicationCommandData[] = [];

        for (const [, c] of this.commands.entries()) {
            if (
                c.type === CommandType.CHAT_INPUT &&
                c instanceof SlashCommand &&
                c.rawbuilder
            ) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                commands.push({
                    type: ApplicationCommandTypes.CHAT_INPUT,
                    ...c.rawbuilder.toJSON(),
                });
            } else
                commands.push({
                    type:
                        c.type === CommandType.MESSAGE
                            ? ApplicationCommandTypes.MESSAGE
                            : ApplicationCommandTypes.USER,
                    name: c.name,
                });
        }

        // const supportGuild = await this.managers.bot.client.guilds.fetch(
        //     this.managers.bot.config.bot.supportGuild,
        // );
        //
        // await this.managers.bot.client.application?.commands.set([]);
        // await this.managers.bot.client.application?.commands.set(commands);
        // await supportGuild.commands.set([]);
        // await supportGuild.commands.set(commands);

        if (!this.managers.bot.client.application) throw "No application";

        await this.managers.bot.rest.put(
            Routes.applicationGuildCommands(
                this.managers.bot.client.application.id,
                this.managers.bot.config.bot.supportGuild,
            ),
            {
                body: commands,
            },
        );
        await this.managers.bot.rest.put(
            Routes.applicationCommands(this.managers.bot.client.application.id),
            {
                body: commands,
            },
        );

        for (const m of this.modules.values()) {
            m.ready();
        }

        Logger.inst.info("Bot ready");
    }

    async message(msg: Message) {
        if (msg.author.bot) return;

        const cache = this.managers.get(ManagerNames.CacheManager);
        if (!cache) return;

        const prefix = msg.guild
            ? await cache.getOrFetchGuildPrefix(msg.guild.id)
            : this.managers.bot.config.bot.defaultPrefix;

        if (msg.content.startsWith(prefix)) {
            let content = msg.content;

            content = content.replace(new RegExp(`^${prefix}`), "");

            const initialMatches = content.match(/^[A-z0-9]+/);
            if (!initialMatches || initialMatches.length !== 1) return;

            let cmd = initialMatches[0].toLowerCase();

            if (this.aliases.has(cmd)) cmd = this.aliases.get(cmd) as string;

            content = content.replace(new RegExp(`^${cmd} ?`), "");

            if (this.commands.has(`slash@${cmd}`)) {
                const command = this.commands.get(
                    `slash@${cmd}`,
                ) as SlashCommand;

                let deferredMessage: Message | undefined = undefined;

                if (command.opts.deferred)
                    deferredMessage = await msg.reply("Processing...");

                try {
                    const options = await parseToOptions(
                        cmd,
                        (command.rawbuilder
                            ? command.rawbuilder.toJSON().options
                            : []) ?? [],
                        content,
                        this.managers.bot.client,
                        msg.guild ?? undefined,
                    );
                    const inc = new IncomingSlashCommand({
                        managers: this.managers,
                        command: command,
                        interaction: undefined,
                        deferredMessage,
                        originalMessage: msg,
                        simulatedOptions: options,
                    });
                    await command.incoming(inc);
                } catch (e) {
                    if (typeof e === "string") {
                        const emsg = `An error occured\n\n\`\`\`\n${e}\n\`\`\``;
                        await msg.reply(emsg);
                    } else {
                        const emsg = `An error occured\n\n\`\`\`\n${e.message}\n\`\`\``;
                        await msg.reply(emsg);
                    }
                    console.error(e);
                }
            }
        }
    }

    async interaction(i: Interaction) {
        if (i.isCommand()) {
            const cmd = this.commands.get(
                `${CommandType.CHAT_INPUT}@${i.commandName}`,
            ) as SlashCommand | undefined;

            if (!cmd)
                return await i.reply(
                    `Command ${i.commandName} is not available in the ${
                        this.managers.bot.debugmode
                            ? "development"
                            : "production"
                    } instance of Crossant. If you think this is a mistake, DM Floffah#6791 "shard ${this.managers.bot.client.shard?.ids.join(
                        ",",
                    )} hasn't caught up"`,
                );

            if (cmd.baseopts.deferred) {
                await i.deferReply({
                    ephemeral: !!cmd.baseopts.ephemeral,
                });
            }

            try {
                const incoming = new IncomingSlashCommand({
                    interaction: i,
                    command: cmd,
                    managers: this.managers,
                } as IncomingSlashCommandOptions<SlashCommandType.INTERACTION>);
                await cmd.incoming(incoming);
            } catch (e) {
                if (typeof e === "string") {
                    const msg = `An error occured\n\n\`\`\`\n${e}\n\`\`\``;
                    if (i.replied) await i.editReply(msg);
                    else await i.reply(msg);
                } else {
                    const msg = `An error occured\n\n\`\`\`\n${e.message}\n\`\`\``;
                    if (i.replied) await i.editReply(msg);
                    else await i.reply(msg);
                }
                console.error(e);
            }
        }
    }
}
