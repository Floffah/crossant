import Command from "../../structure/Command";
import IncomingCommand from "../../structure/IncomingCommand";
import { defaultEmbed } from "../../util/embeds";
import { commandValidation } from "../../util/commands";

export default class Order extends Command {
    constructor() {
        super("order", "Grab a dring bruv", [
            {
                name: "drink",
                description: "The drink you want",
                required: true,
                type: "STRING",
                choices: [
                    {
                        name: "100% pure apple juice",
                        value: "ajuice",
                    },
                    {
                        name: "Ribena",
                        value: "ribena",
                    },
                    {
                        name: "Hot & fermented Ribena",
                        value: "totallynotalcohol",
                    },
                    {
                        name: "Cherry juice",
                        value: "cherry",
                    },
                ],
            },
        ]);
    }

    async incoming(i: IncomingCommand) {
        await commandValidation(i);

        const first =  i.options.first();
        if (!first) throw "Options are required";
        const drink = first.value as string;

        const dbdrink = await this.module.bot.db.drink.findFirst({
            where: {
                name: drink,
            },
            include: {
                images: true,
            },
        });
        if (!dbdrink) throw "No drink of that name found";

        const img =
            dbdrink.images[Math.floor(Math.random() * dbdrink.images.length)];

        await i.reply("", {
            embeds: [
                defaultEmbed()
                    .setTitle("Your order")
                    .setImage((img as any).original),
            ],
        });
    }
}
