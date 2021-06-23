import { Prisma } from "@prisma/client";
import Command from "../../structure/Command";
import IncomingCommand from "../../structure/IncomingCommand";
import { commandValidation, userValidation } from "../../util/commands";

export default class Opt extends Command {
    constructor() {
        super(
            "opt",
            "Opt in and out to specific stat tracking",
            [
                {
                    name: "action",
                    description: "Opt action",
                    type: "STRING",
                    choices: [
                        {
                            name: "in",
                            value: "in",
                        },
                        {
                            name: "out",
                            value: "out",
                        },
                    ],
                    required: true,
                },
                {
                    name: "type",
                    description: "Opt type",
                    type: "STRING",
                    choices: [
                        {
                            name: "words",
                            value: "optWordCount",
                        },
                    ],
                    required: true,
                },
            ],
            true,
            false,
        );
    }

    async incoming(i: IncomingCommand) {
        await commandValidation(i);
        const user = await userValidation(i);

        const action = i.options.get("action");
        if (!action) throw "Must supply action option";
        const type = i.options.get("type");
        if (!type) throw "Must supply type option";

        const data:
            | (Prisma.Without<
                  Prisma.UserUpdateInput,
                  Prisma.UserUncheckedUpdateInput
              > &
                  Prisma.UserUncheckedUpdateInput)
            | (Prisma.Without<
                  Prisma.UserUncheckedUpdateInput,
                  Prisma.UserUpdateInput
              > &
                  Prisma.UserUpdateInput) = {};

        // sometimes i hate typescript
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data[type.value as string] = action.value === "in";

        await this.module.bot.db.user.update({
            data,
            where: {
                id: user.id,
            },
        });

        await i.reply(
            `Successfully set ${type.value} to ${action.value === "in"}`,
        );
    }
}
