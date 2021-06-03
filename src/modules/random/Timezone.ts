import Command from "../../structure/Command";
import { ApplicationCommandOptionChoice } from "discord.js";

const timezones: { [k: string]: [number, number] } = {
    gmt: [0, 0],
    bst: [1, 0],
    est: [-5, 0],
};

const timezoneopts: ApplicationCommandOptionChoice[] = [];

for (const timezone of Object.keys(timezones)) {
    //const tz = timezones[timezone];
    timezoneopts.push({ name: timezone.toUpperCase(), value: timezone });
}

export default class Timezone extends Command {
    constructor() {
        super("timezone", "Translate timezones", [
            {
                name: "from",
                description: "Timezone converting from",
                type: "STRING",
                choices: timezoneopts,
                required: true,
            },
            {
                name: "to",
                description: "Timezone converting to",
                type: "STRING",
                choices: timezoneopts,
                required: true,
            },
            {
                name: "time",
                description: "Time to convert",
                type: "STRING",
                required: true,
            },
        ]);
    }
}
