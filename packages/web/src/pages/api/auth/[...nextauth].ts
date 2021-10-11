import { PrismaAdapter } from "@next-auth/prisma-adapter";
import axios from "axios";
import { APIGuild } from "discord-api-types";
import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { prisma } from "src/lib/api/db";
import { discordGuildsURL } from "src/lib/util/discord";

export default NextAuth({
    providers: [
        Providers.Discord({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            scope: "identify email guilds",
            profile: async (profile, tokens) => {
                const guildres = (
                    await axios.get(discordGuildsURL, {
                        headers: {
                            Authorization: `Bearer ${tokens.accessToken}`,
                        },
                    })
                ).data as APIGuild[];

                // prisma.account.updateMany({
                //     where: {
                //         accessToken: tokens.accessToken,
                //         refreshToken: tokens.refreshToken,
                //         providerId: "discord",
                //     },
                //     data: {
                //         guilds: guildres as unknown as Prisma.JsonArray,
                //     },
                // });

                return {
                    ...Providers.Discord({}).profile(profile, tokens),
                    guilds: guildres,
                };
            },
        }),
    ],
    adapter: PrismaAdapter(prisma),
    callbacks: {
        async session(s, u) {
            return { ...s, user: { ...s.user, id: u.id } };
        },
    },
});
