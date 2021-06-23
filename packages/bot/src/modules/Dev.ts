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

                        if (pull) awaitthis.bot.proc.notePull();
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
