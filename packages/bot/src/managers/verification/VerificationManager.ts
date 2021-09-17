import { SettingType } from "@prisma/client";
import { CaptchaGenerator } from "captcha-canvas";
import {
    GuildChannel,
    GuildMember,
    Message,
    MessageAttachment,
    PartialGuildMember,
    Role,
    TextChannel,
} from "discord.js";
import Manager from "src/managers/common/Manager";
import { ManagerNames } from "src/managers/common/managers";
import ManagersManager from "src/managers/common/ManagersManager";
import { guildSettingNames } from "src/settings/settings";
import { defaultEmbed } from "src/util/messages/embeds";

export default class VerificationManager extends Manager {
    constructor(m: ManagersManager) {
        super(m, ManagerNames.VerificationManager);

        this.managers.on("load", () => this.load());
    }

    async load() {
        this.managers.bot.client.on("guildMemberAdd", (m) => {
            try {
                this.onMemberJoin(m);
            } catch (e) {
                console.error(e);
            }
        });

        this.managers.bot.client.on("messageCreate", (m) => this.onMessage(m));
        this.managers.bot.client.on("guildMemberRemove", (m) => {
            try {
                this.onLeave(m);
            } catch (e) {
                console.error(e);
            }
        });
    }

    async onLeave(m: GuildMember | PartialGuildMember) {
        await this.managers.bot.db.guildVerification.delete({
            where: {
                guildId_userId: {
                    guildId: m.guild.id,
                    userId: m.id,
                },
            },
        });
    }

    async onMemberJoin(m: GuildMember) {
        const guilds = this.managers.get(ManagerNames.GuildManager);
        if (!guilds) return;

        const verificationEnabled = (await guilds.getBasicSetting(
            m.guild,
            guildSettingNames.VerificationEnabled,
            SettingType.BOOLEAN,
        )) as boolean | undefined;
        if (!verificationEnabled) return;

        const verificationChannel = (await guilds.getFancySetting(
            m.guild,
            guildSettingNames.VerificationChannel,
            SettingType.CHANNEL,
        )) as GuildChannel | undefined;
        if (
            !verificationChannel ||
            !(verificationChannel instanceof TextChannel)
        )
            return;

        const captcha = new CaptchaGenerator();
        captcha.setCaptcha({
            color: "#818CF8",
        });
        captcha.setDecoy({
            color: "#818CF8",
        });
        captcha.setTrace({
            color: "#2F3136",
        });
        // LMAO the person who made the typings spelled background wrong
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // captcha.setBackground("#2F3136");
        // this is a path what

        const buffer = await captcha.generate();

        const sentMessage = await verificationChannel.send({
            embeds: [
                defaultEmbed(true)
                    .setTitle("Verification")
                    .setDescription(
                        "Hey, Thank you for joining the server!\n\nWe have a quick challenge before you get in to prove you are not a bot.\nWhat characters do you see in this image? Send it in this channel!",
                    ),
            ],
            files: [new MessageAttachment(buffer, "captcha.png")],
            content: `<@${m.id}>`,
        });

        if (
            await this.managers.bot.db.guildVerification.findUnique({
                where: {
                    guildId_userId: {
                        guildId: m.guild.id,
                        userId: m.id,
                    },
                },
            })
        )
            await this.managers.bot.db.guildVerification.delete({
                where: {
                    guildId_userId: {
                        guildId: m.guild.id,
                        userId: m.id,
                    },
                },
            });

        //const guildverification =
        await this.managers.bot.db.guildVerification.create({
            data: {
                captchaValue: captcha.text,
                sentMessageID: sentMessage.id,
                guild: {
                    connectOrCreate: {
                        where: {
                            id: m.guild.id,
                        },
                        create: {
                            id: m.guild.id,
                        },
                    },
                },
                user: {
                    connectOrCreate: {
                        where: {
                            id: m.id,
                        },
                        create: {
                            id: m.id,
                        },
                    },
                },
            },
        });
    }

    async onMessage(m: Message) {
        if (!m.guild || !m.member) return;

        const guilds = this.managers.get(ManagerNames.GuildManager);
        if (!guilds) return;

        const verificationEnabled = (await guilds.getBasicSetting(
            m.guild,
            guildSettingNames.VerificationEnabled,
            SettingType.BOOLEAN,
        )) as boolean | undefined;
        if (!verificationEnabled) return;

        const verify = await this.managers.bot.db.guildVerification.findUnique({
            where: {
                guildId_userId: {
                    guildId: m.guild.id,
                    userId: m.author.id,
                },
            },
        });
        if (!verify) return;

        if (m.content === verify.captchaValue) {
            if (verify.sentMessageID) {
                const verificationChannel = (await guilds.getFancySetting(
                    m.guild,
                    guildSettingNames.VerificationChannel,
                    SettingType.CHANNEL,
                )) as GuildChannel | undefined;
                if (
                    !verificationChannel ||
                    !(verificationChannel instanceof TextChannel)
                )
                    return;

                try {
                    const oldmsg = await verificationChannel.messages.fetch(
                        verify.sentMessageID,
                    );
                    if (oldmsg.deletable) await oldmsg.delete();
                } catch (e) {
                    // e
                }
            }
            const correctmsg = await m.reply("Correct!");
            await m.delete();

            const verificationRole = (await guilds.getFancySetting(
                m.guild,
                guildSettingNames.VerificationPostVerifyRole,
                SettingType.ROLE,
            )) as Role | undefined;
            if (!verificationRole) return;

            await m.member.roles.add(verificationRole.id);

            await this.managers.bot.db.guildVerification.delete({
                where: {
                    guildId_userId: {
                        guildId: m.guild.id,
                        userId: m.author.id,
                    },
                },
            });

            setTimeout(() => {
                try {
                    correctmsg.delete();
                } catch (e) {
                    // e
                }
            }, 5000);
        }
    }
}
