import { ListMode } from "@prisma/client";
import IncomingCommand from "../structure/IncomingCommand";
import { TextChannel } from "discord.js";

export async function commandValidation(i: IncomingCommand) {
    if (i.guild) {
        let guild = await i.command.module.bot.db.guild.findFirst({
            where: {
                id: i.guild.id,
            },
        });
        if (!guild) {
            guild = {
                id: i.guild.id,
                channelList: [],
                channelListMode: ListMode.Blacklist,
            };
            await i.command.module.bot.db.guild.create({
                data: guild,
            });
        }
        if (i.channel instanceof TextChannel) {
            const has = guild.channelList.includes(i.channel.id);
            if (
                has &&
                guild.channelListMode === ListMode.Blacklist &&
                !i.member?.permissions.has("MANAGE_CHANNELS")
            )
                throw "Channel blacklisted";
            else if (
                !has &&
                guild.channelListMode === ListMode.Whitelist &&
                !i.member?.permissions.has("MANAGE_CHANNELS")
            )
                throw "Channel not whitelisted";
        }
    }
}
