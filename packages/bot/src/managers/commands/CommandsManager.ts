import { Routes } from "discord-api-types/v9";
import {
    ApplicationCommandData,
    Interaction,
    Message,
    MessageActionRow,
    MessageButton,
} from "discord.js";
import AdminModule from "src/managers/commands/modules/Admin";
import BoardsModule from "src/managers/commands/modules/Boards";
import DevModule from "src/managers/commands/modules/Dev";
import UtilModule from "src/managers/commands/modules/Util";
import VerificationModule from "src/managers/commands/modules/Verification";
import IncomingSlashCommand, {
    IncomingSlashCommandOptions,
} from "src/managers/commands/structures/IncomingSlashCommand";
import Module from "src/managers/commands/structures/Module";
import SlashCommand, {
    SlashCommandType,
} from "src/managers/commands/structures/SlashCommand";
import Manager from "src/managers/common/Manager";
import { ManagerNames } from "src/managers/common/managers";
import ManagersManager from "src/managers/common/ManagersManager";
import Logger from "src/util/logging/Logger";
import { defaultEmbed } from "src/util/messages/embeds";
import { userErrorReport } from "src/util/messages/feedback";
import { ApplicationCommandTypes } from "src/util/types/enums";
import BaseCommand, {
    CommandName,
    CommandType,
} from "./structures/BaseCommand";

export default class CommandsManager extends Manager {
    commands: Map<CommandName, BaseCommand> = new Map();
    aliases: Map<string, CommandName> = new Map();
    modules: Map<string, Module> = new Map();

    initialModules: { new (): Module }[] = [
        AdminModule,
        BoardsModule,
        DevModule,
        UtilModule,
        VerificationModule,
    ];

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
        // this.managers.bot.client.on("messageCreate", (m) => this.message(m));
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
                commands.push({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    type: ApplicationCommandTypes.CHAT_INPUT,
                    ...c.rawbuilder.toJSON(),
                });
            } else
                commands.push({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
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
        if (this.managers.bot.debugmode) {
            await this.managers.bot.rest.put(
                Routes.applicationGuildCommands(
                    this.managers.bot.client.application.id,
                    "800781425073979432",
                ),
                {
                    body: commands,
                },
            );
            Logger.inst.debug("Pushed commands to alternate test server");
        }
        await this.managers.bot.rest.put(
            Routes.applicationCommands(this.managers.bot.client.application.id),
            {
                body: this.managers.bot.debugmode ? [] : commands,
            },
        );

        for (const m of this.modules.values()) {
            m.ready();
        }

        Logger.inst.info("Bot ready");
    }

    async message(msg: Message) {
        if (msg.author.bot) return;

        const cache = this.managers.get(ManagerNames.GuildManager);
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

            // content = content.replace(new RegExp(`^${cmd} ?`), "");

            if (this.commands.has(`slash@${cmd}`))
                await msg.reply({
                    embeds: [
                        defaultEmbed()
                            .setTitle("Message commands disabled")
                            .setDescription(
                                `For the past couple of months, invoking Crossants commands via messages have been getting phased out. This is because Discord will be enabling a whitelist for Discord bots to read message content.`,
                            ),
                    ],
                    components: [
                        new MessageActionRow({
                            components: [
                                new MessageButton({
                                    style: "LINK",
                                    label: "Learn more",
                                    url: "https://support-dev.discord.com/hc/en-us/articles/4404772028055-Message-Content-Access-Deprecation-for-Verified-Bots",
                                }),
                            ],
                        }),
                    ],
                });

            // if (this.commands.has(`slash@${cmd}`)) {
            //     const command = this.commands.get(
            //         `slash@${cmd}`,
            //     ) as SlashCommand;
            //
            //     let deferredMessage: Message | undefined = undefined;
            //
            //     if (command.opts.deferred)
            //         deferredMessage = await msg.reply(
            //             "Please note that message commands will be Disabled on Crossant soon because Discord is making messages a privileged intent.\nProcessing...",
            //         );
            //     else
            //         deferredMessage = await msg.reply(
            //             "Please note that message commands will be Disabled on Crossant soon because Discord is making messages a privileged intent.",
            //         );
            //
            //     try {
            //         const options = await parseToOptions(
            //             cmd,
            //             command.rawbuilder,
            //             content,
            //             this.managers.bot.client,
            //             msg.guild ?? undefined,
            //         );
            //         const inc = new IncomingSlashCommand({
            //             managers: this.managers,
            //             command: command,
            //             interaction: undefined,
            //             deferredMessage,
            //             originalMessage: msg,
            //             simulatedOptions: options,
            //         });
            //         await command.incoming(inc);
            //     } catch (e) {
            //         if (typeof e === "string") {
            //             const emsg = `An error occured\n\n\`\`\`\n${e}\n\`\`\``;
            //             await msg.reply(emsg);
            //         } else {
            //             const emsg = `An error occured\n\n\`\`\`\n${e.message}\n\`\`\``;
            //             await msg.reply(emsg);
            //         }
            //         console.error(e);
            //     }
            // }
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
                await (i.replied || i.deferred ? i.editReply : i.reply).call(
                    i,
                    ...userErrorReport(e, this.managers),
                );
            }
        }
    }
}
