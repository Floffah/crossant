import Command from "../../structure/Command";
import IncomingCommand from "../../structure/IncomingCommand";
import Mustache from "mustache";
import { User } from "discord.js";

export default class Unfortunate extends Command {
    unfortunates: string[] = [
        "**{{user}}** was hit by a bus...",
        "**{{user}}** got on Montego Air Flight 828",
        "**{{user}}** got swooped by a seagull",
        "A pigeon got a bit peckish and pecked **{{user}}** to death",
        "**{{user}}** was hit by EGG",
        "**{{user}}** never made an omelette",
    ];

    constructor() {
        super("unfortunate", "Da baby");
    }

    async incoming(i: IncomingCommand) {
        const dat: { [k: string]: string } = {
            user: "N/A",
        };

        let user: User;
        if (i.guild) {
            await i.guild.members.fetch();
            let member = await i.guild.members.cache.random();
            member = await member.fetch(true);
            user = await member.user.fetch();
        } else if (i.user) {
            user = await i.user.fetch();
        } else {
            await i.reply(`Could not find a user`, {
                debug: {
                    iguild: !!i.guild,
                    iraw: !!i.rawInteraction,
                    irawguild: !!i.rawInteraction?.guild,
                    iuser: !!i.user,
                },
            });
            return;
        }
        dat.user = user.username + "#" + user.discriminator;

        await i.reply(
            Mustache.render(
                this.unfortunates[
                    Math.floor(Math.random() * this.unfortunates.length)
                ],
                dat,
            ),
        );
    }
}
