import Module from "../structure/Module";
import Opt from "./Stats/Opt";
import { Message } from "discord.js";
import { Prisma } from "@prisma/client";
import Stat from "./Stats/Stat";

export default class Stats extends Module {
    constructor() {
        super("stats");
    }

    load() {
        this.registerCommand(new Opt());
        this.registerCommand(new Stat());
    }

    ready() {
        this.bot.on("message", async (m) => await this.trackWords(m));
    }

    isFiller(str: string) {
        const filters: RegExp[] = [
            /^[wt]hat/,
            /^the[A-z]?/,
            // /^it/,
            /^this/,
            /^well/,
            /^hm/,
            /^like/,
            // /^you/,
            // /^see/,
            /^mean/,
            /^know/,
            /^guess/,
            /^suppose/,
            // /^ok/,
            /^okay/,
            /^right/,
            /^m.hm+$/,
            // /he$/,
            /^with/,
            /^even/,
            /^about/,
            /^were/,
            /^make/,
        ];

        for (const filter of filters) {
            const matches = str.match(filter);

            if (matches && matches.length > 0) return true;
        }

        return false;
    }

    async trackWords(m: Message) {
        if (m.author.bot) return;

        const user = await this.bot.db.user.findFirst({
            where: {
                id: m.author.id,
            },
        });

        if (!user) return;
        if (!user.optWordCount) return;

        const counted: { [k: string]: number } = {};

        for (const word of m.content.toLowerCase().split(" ")) {
            if (/^[A-z][A-z][A-z][A-z]+$/.test(word) && !this.isFiller(word)) {
                if (typeof counted[word] !== "undefined") {
                    counted[word] += 1;
                } else {
                    counted[word] = 1;
                }
            }
        }

        if (Object.keys(counted).length <= 0) return;

        for (const word of Object.keys(counted)) {
            await this.bot.db.wordUse.upsert({
                where: {
                    word_userId: {
                        word,
                        userId: m.author.id,
                    },
                },
                update: {
                    total: {
                        increment: counted[word],
                    },
                },
                create: {
                    word,
                    userId: m.author.id,
                    total: counted[word],
                },
            });
        }

        try {
            const tenth = await this.bot.db.wordUse.findFirst({
                orderBy: {
                    total: Prisma.SortOrder.desc,
                },
                where: {
                    userId: m.author.id,
                },
                skip: 9,
                take: 1,
            });

            if (tenth) {
                await this.bot.db.wordUse.deleteMany({
                    where: {
                        total: {
                            lt: tenth.total,
                        },
                    },
                });
            }
        } catch (e) {
            await m.react("❌");
            console.log(e);
        }
    }
}
