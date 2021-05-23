import {
    ActivityType,
    ApplicationCommand,
    Client,
    Collection,
    Interaction,
    Snowflake,
} from "discord.js";
import Module from "../structure/Module";
import Command from "../structure/Command";
import Bar from "../modules/Bar";
import IncomingCommand from "../structure/IncomingCommand";
import Random from "../modules/Random";
import Dev from "../modules/Dev";
import Logger from "../util/Logger";
import { PrismaClient } from "@prisma/client";
import ContentManager from "./ContentManager";
import Mustache from "mustache";

export const statuses: [ActivityType, string][] = [
    ["PLAYING", "with the cabinets"],
    ["PLAYING", "with some bottles"],
    ["WATCHING", "people get drunk"],
    ["WATCHING", "{{ customers }} customers"],
];

export default class Bot extends Client {
    logger = new Logger();
    db = new PrismaClient({
        log:
            process.env.DEBUG === "true"
                ? ["query", "info", "error", "warn"]
                : ["error", "warn"],
    });
    cm = new ContentManager(this);

    commands: Map<string, Command> = new Map();
    modules: Map<string, Module> = new Map();

    icache: Collection<Snowflake, ApplicationCommand>;

    state: { [k: string]: boolean | number | string } = {
        debug: false,
    };

    currentstatus = 0;

    constructor() {
        super({
            intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
            partials: [
                "CHANNEL",
                "GUILD_MEMBER",
                "MESSAGE",
                "REACTION",
                "USER",
            ],
        });

        this.logger.dodebug = process.env.DEBUG === "true";
    }

    async start() {
        this.on("ready", () => this.ready());
        this.on("interaction", (i) => this.interaction(i));

        this.registerModule(new Bar());
        this.registerModule(new Random());
        this.registerModule(new Dev());

        await this.login(process.env.TOKEN);
    }

    registerModule(m: Module) {
        m.bot = this;
        this.modules.set(m.name, m);
        m.load();
    }

    registerCommand(m: Module, c: Command) {
        c.module = m;
        this.commands.set(c.name, c);
        m.commands.push(c.name);
    }

    async ready() {
        for (const m of this.modules.values()) {
            m.ready();
        }

        const cmdcache = await this.application?.commands.fetch();
        const cachemap: Map<string, Snowflake> = new Map();

        if (!cmdcache) return;

        for (const e of cmdcache.entries()) {
            cachemap.set(e[1].name, e[0]);
        }

        for (const c of this.commands.values()) {
            if (cachemap.has(c.name)) {
                this.logger.info(`Editing ${c.name}`);
                await this.application?.commands.edit(
                    cachemap.get(c.name) as Snowflake,
                    await c.get(),
                );
            } else {
                this.logger.info(`Registering ${c.name}`);
                await this.application?.commands.create(await c.get());
            }
        }

        const presencer = async () => {
            const newstatus = statuses[this.currentstatus];

            this.user?.setPresence({
                activities: [
                    {
                        name: Mustache.render(newstatus[1], {
                            customers: this.users.cache.size,
                        }),
                        type: newstatus[0],
                    },
                ],
            });

            this.currentstatus += 1;
            if (this.currentstatus > statuses.length - 1)
                this.currentstatus = 0;
        };

        presencer();

        setInterval(() => presencer(), 10000);

        this.logger.info("ready");

        await this.cm.createDrink("ajuice", [
            "https://ui.assets-asda.com/dm/asdagroceries/5051413288191_T1?defaultImage=asdagroceries/noImage&resMode=sharp2&id=uuiSh1&fmt=jpg&fit=constrain,1&wid=256&hei=256",
        ]);
        await this.cm.createDrink("totallynotalcohol", [
            "http://lh3.googleusercontent.com/-i5ulqKHVAKU/VmqD6m1eqII/AAAAAAAACD8/rPnESOWzAHE/s640/blogger-image-1791737332.jpg",
        ]);
        await this.cm.createDrink("ribena", [
            "https://www.ribena.co.uk/product_images/_orig/306.png",
        ]);
        await this.cm.createDrink("cherry", [
            "https://media.discordapp.net/attachments/773812178348277810/845767659270176788/invert.png",
        ]);
    }

    async interaction(i: Interaction) {
        if (i.isCommand() && i.command && this.commands.has(i.command.name)) {
            const cmd = this.commands.get(i.command.name);
            if (!cmd) return;
            const inc = new IncomingCommand({
                rawInteraction: i,
                bot: this,
                command: cmd,
            });
            try {
                await cmd.incoming(inc);
            } catch (e) {
                if (typeof e === "string") {
                    await inc.reject(e);
                } else {
                    await inc.reject(e.message, {
                        debug: {
                            message: e.message,
                            name: e.name,
                        },
                    });
                }
            }
        }
    }
}
