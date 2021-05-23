import Bot from "./Bot";
import axios from "axios";
import { Prisma } from "@prisma/client";

export default class ContentManager {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    async addImage(
        content: `data:image/${string};base64,${string}` | string,
        original?: string,
    ) {
        return await this.bot.db.image.create({
            data: {
                content,
                original,
            },
        });
    }

    async addImageFromURL(url: string) {
        const res = await axios.get(url, {
            responseType: "arraybuffer",
        });
        if (!res.headers["content-type"].startsWith("image"))
            throw "Must be image";
        const content = `data:${
            res.headers["content-type"]
        };base64,${Buffer.from(res.data).toString("base64")}`;
        return await this.addImage(content, url);
    }

    async createDrink(name: string, imgs: (number | string)[]) {
        const existed = await this.bot.db.drink.findFirst({
            where: {
                name,
            },
        });
        if (existed) return;

        const connect: Prisma.ImageWhereUniqueInput[] = [];

        for (const img of imgs) {
            if (typeof img === "number") {
                connect.push({ id: img });
            } else {
                let id;
                if (/^https?:\/\/.*$/.test(img))
                    id = (await this.addImageFromURL(img)).id;
                else id = (await this.addImage(img)).id;
                connect.push({ id });
            }
        }

        return await this.bot.db.drink.create({
            data: {
                name,
                images: {
                    connect,
                },
            },
        });
    }
}
