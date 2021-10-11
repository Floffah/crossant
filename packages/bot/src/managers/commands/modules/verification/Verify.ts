import { SettingType } from "@prisma/client";
import { GuildChannel } from "discord.js";
import IncomingSlashCommand from "src/managers/commands/structures/IncomingSlashCommand";
import SlashCommand from "src/managers/commands/structures/SlashCommand";
import { ManagerNames } from "src/managers/common/managers";
import { guildSettingNames } from "src/settings/settings";

export default class VerifyCommand extends SlashCommand {
    constructor() {
        super(
            "verify",
            "Verify yourself or a user",
            (b) =>
                b.addUserOption((o) =>
                    o
                        .setName("who")
                        .setDescription("Who to verify")
                        .setRequired(false),
                ),
            { deferred: true, ephemeral: true },
        );
    }

    async incoming(i: IncomingSlashCommand) {
        if (
            !i.guild ||
            !i.member ||
            !(i.channel instanceof GuildChannel) ||
            !i.channel ||
            !i.channel.isText()
        )
            throw "Must be ran in a guild and in a text channel";

        const who = i.options.getUser("who");
        if (who && !i.member.permissions.has("MANAGE_ROLES"))
            throw "No permission";

        const guilds = this.module.managers.get(ManagerNames.GuildManager);
        if (!guilds) throw "No guild manager";

        const verificationEnabled = (await guilds.getBasicSetting(
            i.guild,
            guildSettingNames.VerificationEnabled,
            SettingType.BOOLEAN,
        )) as boolean | undefined;
        if (!verificationEnabled) throw "Verification not enabled";

        const verification = this.module.managers.get(
            ManagerNames.VerificationManager,
        );
        if (!verification) throw "No verification manager";

        if (who) {
            await verification.verifyMember(
                await i.guild.members.fetch(who.id),
                guilds,
                true,
            );

            await i.reply(
                `Verifying user in this guild's verification channel...`,
            );
        } else {
            await verification.verifyMember(i.member, guilds, true);

            await i.reply(
                "A message should be sent in a few seconds with instructions on how to verify",
            );
        }
    }
}
