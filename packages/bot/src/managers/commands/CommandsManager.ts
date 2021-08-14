import Manager from "../Manager";
import ManagersManager from "../ManagersManager";
import Module from "./structures/Module";
import BaseCommand, {
    CommandName,
    CommandType,
} from "./structures/BaseCommand";
import { Interaction } from "discord.js";
import SlashCommand, { SlashCommandType } from "./structures/SlashCommand";
import IncomingSlashCommand, {
    IncomingSlashCommandOptions,
} from "./structures/IncomingSlashCommand";

export default class CommandsManager extends Manager {
    commands: Map<CommandName, BaseCommand> = new Map();
    aliases: Map<string, CommandName> = new Map();
    modules: Map<string, Module> = new Map();

    initialModules: { new (): Module }[] = [];

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
    }

    registerModule(m: Module) {
        m.managers = this.managers;
        this.modules.set(m.name, m);
        m.load(); // send the load event to the module
    }

    registerCommand(m: Module, c: BaseCommand) {
        c.module = m;
        this.commands.set(c.realname, c);
        m.commands.push(c.name);
        if (c.aliases && c.aliases.length > 0) {
            for (const alias of c.aliases) {
                this.aliases.set(alias, c.realname);
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
                    } instance of Crossant. If you think this is a mistake, DM Floffah#6791 "mr dev man shard ${this.managers.bot.client.shard?.ids.join(
                        ",",
                    )} hasn't caught up" (word for word :smile:)`,
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
