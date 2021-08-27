import { MessageEmbed } from "discord.js";

export const defaultEmbed = (footer?: boolean) => {
    const embed = new MessageEmbed().setColor("#2F3136");

    if (footer) embed.setFooter("Bot by Floffah");

    return embed;
};
