import Command from "../../structure/Command";
import IncomingCommand from "../../structure/IncomingCommand";
import { commandValidation } from "../../util/commands";

export default class State extends Command {
    constructor() {
        super("state", "For bot admins to change the instance state", [
            {
                name: "key",
                description: "State key",
                required: true,
                type: "STRING",
                choices: [
                    {
                        name: "debug",
                        value: "debug",
                    },
                ],
            },
            {
                name: "type",
                description: "State type",
                required: true,
                type: "STRING",
                choices: [
                    {
                        name: "string",
                        value: "string",
                    },
                    {
                        name: "boolean",
                        value: "boolean",
                    },
                    {
                        name: "number",
                        value: "number",
                    },
                ],
            },
            {
                name: "value",
                description: "State value",
                required: true,
                type: "STRING",
            },
        ]);
    }

    async incoming(i: IncomingCommand) {
        await commandValidation(i);

        let key: undefined | string,
            value: undefined | string | boolean | number,
            type: undefined | string = undefined;

        if (i.options) {
            if (!i.user || i.user.id !== "221524691079266314")
                return i.reject("User not whitelisted");

            for (const option of i.options) {
                if (option.name === "key" && typeof option.value === "string")
                    key = option.value;
                if (option.name === "type" && typeof option.value === "string")
                    type = option.value;
                if (option.name === "value" && typeof option.value === "string")
                    value = option.value;
            }
        }

        if (!key || !value || !type)
            return i.reject("Required option not defined");

        if (!Object.prototype.hasOwnProperty.call(this.module.bot.state, key))
            return i.reject("Unknown state name");

        if (type === "boolean" && typeof value === "string")
            value = value === "true";
        else if (type === "number" && typeof value === "string")
            value = parseInt(value);

        if (typeof this.module.bot.state[key] !== typeof value)
            return i.reject("Incompatible types");

        this.module.bot.state[key] = value;

        await i.reply(`${key} is now set to ${value} (${type})`, {
            debug: { key, value, type },
        });

        return;
    }
}
