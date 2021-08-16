import { ApplicationCommandData, Interaction } from "discord.js";
import Module from "managers/commands/structures/Module";
import SlashCommand, {
    SlashCommandType,
} from "managers/commands/structures/SlashCommand";
import Manager from "managers/Manager";
import ManagersManager from "managers/ManagersManager";
import UtilModule from "managers/commands/modules/Util";
import BaseCommand, {
    CommandName,
    CommandType,
} from "./structures/BaseCommand";
import IncomingSlashCommand, {
    IncomingSlashCommandOptions,
} from "managers/commands/structures/IncomingSlashCommand";

export default class CommandsManager extends Manager {
    commands: Map<CommandName, BaseCommand> = new Map();
    aliases: Map<string, CommandName> = new Map();
    modules: Map<string, Module> = new Map();

    initialModules: { new (): Module }[] = [UtilModule];

    constructor(m: ManagersManager) {
        super(m, "commands");

        this.managers.on("load", () => this.load());
    }

    async load() {
        for (const module of this.initialModules) {
            const m = new module();
            this.registerModule(m);
        }

        this.managers.bot.client.on("interactionCreate", (i) =>
            this.interaction(i),
        );
        this.managers.bot.client.on("ready", () => this.ready());
    }

    registerModule(m: Module) {
        m.managers = this.managers;
        this.modules.set(m.name, m);
        this.managers.bot.logger.debug(`Registered module ${m.name}`);
        if (m.load) m.load(); // send the load event to the module
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
                commands.push({ type: "CHAT_INPUT", ...c.rawbuilder.toJSON() });
            } else
                commands.push({
                    type: c.type === CommandType.MESSAGE ? "MESSAGE" : "USER",
                    name: c.name,
                });
        }

        this.managers.bot.client.application?.commands.set(commands);

        for (const m of this.modules.values()) {
            m.ready();
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
                if ("message" in e) {
                    const msg = `An error occured\n\n\`\`\`\n${e.message}\n\`\`\``;
                    if (i.replied) await i.editReply(msg);
                    else await i.reply(msg);
                } else {
                    const msg = `An error occured\n\n\`\`\`\n${e}\n\`\`\``;
                    if (i.replied) await i.editReply(msg);
                    else await i.reply(msg);
                }
            }
        }
    }
}
