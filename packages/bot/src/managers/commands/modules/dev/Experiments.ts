import { stripIndents } from "common-tags";
import IncomingSlashCommand from "src/managers/commands/structures/IncomingSlashCommand";
import SlashCommand from "src/managers/commands/structures/SlashCommand";
import { defaultEmbed } from "src/util/messages/embeds";

export default class ExperimentsCommand extends SlashCommand {
    constructor() {
        super(
            "experiments",
            "Get information about features currently in development, and for bot admins to enable experiments on more users/servers",
            (s) =>
                s
                    .addSubcommand((c) =>
                        c
                            .setName("info")
                            .setDescription("Get info about an experiment")
                            .addStringOption((o) =>
                                o
                                    .setName("experiment")
                                    .setDescription("The experiment to view")
                                    .setRequired(true),
                            ),
                    )
                    .addSubcommand((c) =>
                        c
                            .setName("list")
                            .setDescription(
                                "See a list of current experiments",
                            ),
                    )
                    .addSubcommand((c) =>
                        c
                            .setName("force")
                            .setDescription(
                                "Force an experiment to be available on a specific server or for a specific user",
                            )
                            .addStringOption((o) =>
                                o
                                    .setName("experiment")
                                    .setDescription(
                                        "The experiment to add or remove",
                                    )
                                    .setRequired(true),
                            )
                            .addStringOption((o) =>
                                o
                                    .setName("type")
                                    .setDescription("Type of force")
                                    .setRequired(true)
                                    .addChoices([
                                        ["add", "add"],
                                        ["remove", "remove"],
                                    ]),
                            )
                            .addStringOption((o) =>
                                o
                                    .setName("what")
                                    .setDescription(
                                        "What to effect, user or guild",
                                    )
                                    .setRequired(true)
                                    .addChoices([
                                        ["guild", "guild"],
                                        ["user", "user"],
                                    ]),
                            )
                            .addStringOption((o) =>
                                o
                                    .setName("who")
                                    .setDescription(
                                        "The id of the guild or user",
                                    )
                                    .setRequired(true),
                            ),
                    )
                    .addSubcommand((c) =>
                        c
                            .setName("create")
                            .setDescription("Create an experiment")
                            .addStringOption((o) =>
                                o
                                    .setName("name")
                                    .setDescription("Experiment name")
                                    .setRequired(true),
                            )
                            .addStringOption((o) =>
                                o
                                    .setName("description")
                                    .setDescription("Experiment description")
                                    .setRequired(true),
                            )
                            .addStringOption((o) =>
                                o
                                    .setName("stage")
                                    .setDescription("Experiment stage")
                                    .setRequired(true)
                                    .addChoices(
                                        ["CANARY", "BETA", "RC"].map((s) => [
                                            s,
                                            s,
                                        ]),
                                    ),
                            )
                            .addStringOption((o) =>
                                o
                                    .setName("effector")
                                    .setDescription("Experiment effector")
                                    .setRequired(true)
                                    .addChoices(
                                        ["USER", "GUILD", "BOTH"].map((s) => [
                                            s,
                                            s,
                                        ]),
                                    ),
                            ),
                    ),
        );
    }

    async incoming(i: IncomingSlashCommand) {
        const sub = i.options.getSubcommand(true);

        if (sub === "list") await this.listCommand(i);
        else if (sub === "info") await this.infoCommand(i);
        else if (sub === "force") await this.forceCommand(i);
        else if (sub === "create") await this.createCommand(i);
    }

    async listCommand(i: IncomingSlashCommand) {
        const experiments =
            await this.module.managers.bot.db.experiment.findMany();

        if (experiments.length === 0)
            await i.reply({
                embeds: [
                    defaultEmbed()
                        .setTitle("Experiments")
                        .setDescription(
                            "No experiments are currently running!",
                        ),
                ],
            });
        else
            await i.reply({
                embeds: [
                    defaultEmbed()
                        .setTitle("Experiments")
                        .setDescription(
                            experiments.map((e) => e.name).join(", "),
                        ),
                ],
            });
    }

    async infoCommand(i: IncomingSlashCommand) {
        const experiment = i.options.getString("experiment", true);

        const e = await this.module.managers.bot.db.experiment.findUnique({
            where: {
                name: experiment.toLowerCase(),
            },
        });
        if (!e) throw `No such experiment ${experiment.toLowerCase()}`;

        await i.reply({
            embeds: [
                defaultEmbed()
                    .setTitle(e.name)
                    .setDescription(
                        stripIndents`
                          description: ${e.description}
                          stage: ${e.stage}
                          effects: ${e.effector}
                        `,
                    ),
            ],
        });
    }

    async forceCommand(i: IncomingSlashCommand) {
        if (!this.module.managers.bot.config.bot.owners.includes(i.user.id))
            throw "No permission";

        const experiment = i.options.getString("experiment", true);
        const type = i.options.getString("type", true) as "add" | "remove";
        const what = i.options.getString("what", true) as "guild" | "user";
        const who = i.options.getString("who", true);

        const e = await this.module.managers.bot.db.experiment.findUnique({
            where: {
                name: experiment.toLowerCase(),
            },
        });
        if (!e) throw `No such experiment ${experiment.toLowerCase()}`;

        await this.module.managers.bot.db.experiment.update({
            where: {
                name: e.name,
            },
            data:
                what === "guild"
                    ? {
                          guildsEnabled:
                              type === "add"
                                  ? {
                                        connectOrCreate: {
                                            where: {
                                                id: who,
                                            },
                                            create: {
                                                id: who,
                                            },
                                        },
                                    }
                                  : {
                                        disconnect: {
                                            id: who,
                                        },
                                    },
                      }
                    : {
                          usersEnabled:
                              type === "add"
                                  ? {
                                        connectOrCreate: {
                                            where: {
                                                id: who,
                                            },
                                            create: {
                                                id: who,
                                            },
                                        },
                                    }
                                  : {
                                        disconnect: {
                                            id: who,
                                        },
                                    },
                      },
        });

        await i.reply("Done!");
    }

    async createCommand(i: IncomingSlashCommand) {
        if (!this.module.managers.bot.config.bot.owners.includes(i.user.id))
            throw "No permission";

        const name = i.options.getString("name", true).toLowerCase();
        const description = i.options.getString("description", true);
        const stage = i.options.getString("stage", true) as
            | "CANARY"
            | "BETA"
            | "RC";
        const effector = i.options.getString("effector", true) as
            | "USER"
            | "GUILD"
            | "BOTH";

        this.module.managers.bot.db.experiment.create({
            data: {
                name,
                description,
                stage,
                effector,
            },
        });

        await i.reply("Done!");
    }
}
