import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import {
    Guild,
    GuildChannel,
    MessageActionRow,
    MessageButton,
    PermissionString,
    TextBasedChannels,
} from "discord.js";
import IncomingSlashCommand from "src/managers/commands/structures/IncomingSlashCommand";
import { ManagerNames } from "src/managers/common/managers";
import { guildSettingNames } from "src/settings/settings";
import { defaultEmbed } from "src/util/messages/embeds";

export enum SetupTypes {
    VerifyMessage = "verifyMessage",
}

export const Setups: Record<
    SetupTypes,
    {
        options?: (
            b: SlashCommandSubcommandBuilder,
        ) => SlashCommandSubcommandBuilder;
        run: (
            i: Omit<IncomingSlashCommand, "reply"> & {
                channel: TextBasedChannels & GuildChannel;
                guild: Guild;
            },
        ) => any;
        description: string;
        permission: PermissionString;
    }
> = {
    [SetupTypes.VerifyMessage]: {
        description:
            "Send a message in the current channel with a verify button",
        permission: "MANAGE_CHANNELS",
        run: async (i) => {
            const guilds = i.managers.get(ManagerNames.GuildManager);
            if (!guilds) throw "No guilds manager present";

            const msg = await i.channel.send({
                embeds: [
                    defaultEmbed()
                        .setTitle(`${i.guild.name} Verification`)
                        .setDescription(
                            "Before you get access to the server, you need to complete a bot challenge.\nType out the text you see in the image below!\n\nDon't see an image? Press the green 'Verify' button. ",
                        ),
                ],
                components: [
                    new MessageActionRow({
                        components: [
                            new MessageButton({
                                style: "SUCCESS",
                                customId: "verify",
                                label: "Verify",
                                emoji: "✅",
                            }),
                        ],
                    }),
                ],
            });

            await guilds.setSetting(
                i.guild,
                guildSettingNames.VerificationPermMessage,
                msg.id,
            );

            await i.editReply(`Done!`);
        },
    },
};
