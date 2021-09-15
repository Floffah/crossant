import { stripIndents } from "common-tags";
import prettyMilliseconds from "pretty-ms";
import IncomingSlashCommand from "src/managers/commands/structures/IncomingSlashCommand";
import SlashCommand from "src/managers/commands/structures/SlashCommand";
import { defaultEmbed } from "src/util/messages/embeds";

const pkg = require("../../../../../package.json");

export default class InfoCommand extends SlashCommand {
    constructor() {
        super("info", "Shows information about the bot and current shard");
    }

    async incoming(i: IncomingSlashCommand) {
        await i.reply({
            embeds: [
                defaultEmbed()
                    .addField(
                        "Shard & timings",
                        stripIndents`
                **Shard:** ${this.module.managers.bot.client.shard?.ids.join(
                    ", ",
                )}
                **Shard process uptime:** ${prettyMilliseconds(
                    process.uptime() * 1000,
                )}
                **Shard bot uptime:** ${prettyMilliseconds(
                    Date.now() - this.module.managers.bot.readyTime,
                )}
                **Shard manager uptime:** ${
                    this.module.managers.bot.shardmanstarttime
                        ? prettyMilliseconds(
                              Date.now() -
                                  this.module.managers.bot.shardmanstarttime,
                          )
                        : "No time data was passed to current worker"
                }
            `,
                        false,
                    )
                    .addField(
                        "Author",
                        "Bot created by Floffah#6791\n[Github repo](https://github.com/floffah/crossant/tree/v2)",
                        true,
                    )
                    .addField(
                        "Versioning",
                        stripIndents`
                        **Version:** ${pkg.version}
                        **Discord.js version:** ${pkg.dependencies["discord.js"]}
                        **Prisma version:** ${pkg.dependencies["@prisma/client"]}
                        **Typescript version:** ${pkg.devDependencies.typescript}
                        **Node version:** ${process.version}
                    `,
                        true,
                    ),
            ],
        });
    }
}
