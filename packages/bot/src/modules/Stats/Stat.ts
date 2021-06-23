import { User } from "@prisma/client";
import Command from "../../structure/Command";
import IncomingCommand from "../../structure/IncomingCommand";
import { commandValidation, userValidation } from "../../util/commands";
import { Chart } from "chart.js";
import { Canvas, createCanvas } from "canvas";

export default class Stat extends Command {
    constructor() {
        super("stat", "Get stats you have opted in to", [
            {
                name: "type",
                description: "Type of stat",
                type: "STRING",
                choices: [
                    {
                        name: "words",
                        value: "words",
                    },
                ],
                required: true,
            },
        ]);
    }

    async incoming(i: IncomingCommand) {
        await commandValidation(i);
        const user = await userValidation(i);

        const type = i.options.get("type");
        if (!type) throw "Must specify type";

        if (type.value === "words") await this.words(i, user);
        else throw "No such type";
    }

    async words(i: IncomingCommand, user: User) {
        if (!user.optWordCount) throw "Must opt in";

        const top = await this.module.bot.db.wordUse.findMany({
            where: {
                userId: i.user.id,
            },
            orderBy: {
                total: "desc",
            },
            take: 10,
        });

        const data = top.map((word) => word.total);
        const labels = top.map((word) => word.word);
        const colours: string[] = [];

        for (let i = 0; i < 10; i++) {
            colours.push(
                "#" + Math.floor(Math.random() * 16777215).toString(16),
            );
        }

        let canvas = createCanvas(600, 600);
        let chart = new Chart(canvas.getContext("2d"), {
            type: "doughnut",
            options: {
                responsive: false,
                animation: {
                    duration: 0,
                },
                color: "#FFFFFF",
                // font: {
                //     size: 30, // doesnt work in production
                // },
            },
            data: {
                labels,
                datasets: [
                    {
                        label: "Words",
                        data,
                        backgroundColor: colours,
                    },
                ],
            },
        });

        chart.render();

        await i.reply(undefined, {
            files: [canvas.toBuffer()],
        });
        canvas = null as unknown as Canvas;
        chart = null as unknown as Chart<"doughnut", number[], "string">;
    }
}
