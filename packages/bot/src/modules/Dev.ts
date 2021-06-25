import Module from "../structure/Module";
import State from "./dev/State";

export default class Dev extends Module {
    constructor() {
        super("dev");
    }

    load() {
        this.registerCommand(new State());

        this.bot.on("message", async (m) => {
            if (
                m.guild &&
                m.guild.id === "697340602504970261" &&
                [
                    "697340603066744864",
                    "774699998985191494",
                    "774615671488249908",
                ].includes(m.channel.id)
            ) {
                m.reply(
                    "Floffah is not available for support in this server. Please ping another member of support or member of staff to address your issue.",
                );
            }

            if (
                m.mentions.members &&
                m.author.id === "221524691079266314" &&
                m.mentions.members.size > 0
            ) {
                const mention = m.mentions.members.first();

                if (mention && mention.id === "736604055505469503") {
                    if (
                        m.content.includes("reboot") ||
                        m.content.includes("restart")
                    ) {
                        const pull = m.content.includes("pull");

                        if (pull) await this.bot.proc.notePull();
                        const sent = await m.channel.send(
                            `Rebooting ${
                                pull
                                    ? "and pulling from github"
                                    : "without pulling from github"
                            }`,
                        );
                        await this.bot.proc.noteReboot(m.author, sent);
                        process.exit();
                    }
                }
            }
        });
    }
}
