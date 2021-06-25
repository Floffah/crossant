import Module from "../structure/Module";
import State from "./dev/State";
import { Collection, GuildMember, Snowflake } from "discord.js";

export default class Dev extends Module {
    constructor() {
        super("dev");
    }

    membersHasID(m: Collection<Snowflake, GuildMember>, id: string) {
        for (const member of m.values()) {
            if (member.id === id) return true;
        }
        return false;
    }

    load() {
        this.registerCommand(new State());

        this.bot.on("message", async (m) => {
            if (
                m.guild &&
                m.guild.id === "697340602504970261" &&
                !m.author.bot &&
                m.mentions.members &&
                this.membersHasID(m.mentions.members, "221524691079266314") &&
                [
                    "697340603066744864",
                    "774699998985191494",
                    "774615671488249908",
                ].includes(m.channel.id)
            ) {
                const msg = await m.reply(
                    "Floffah is not available for support in this server. Please ask another member of support or member of staff to address your issue.",
                );

                setTimeout(() => {
                    if (msg.deleted) msg.delete();
                }, 20000);
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
