import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Prisma } from "@prisma/client";
import axios from "axios";
import { APIGuild } from "discord-api-types";
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "src/lib/api/db";
import { discordGuildsURL } from "src/lib/util/discord";

export default NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            authorization:
                "https://discord.com/api/oauth2/authorize?scope=identify+email+guilds",
            token: "https://discord.com/api/oauth2/token",
            userinfo: "https://discord.com/api/users/@me",
            profile: async (profile, tokens) => {
                const guildres = (
                    await axios.get(discordGuildsURL, {
                        headers: {
                            Authorization: `Bearer ${tokens.access_token}`,
                        },
                    })
                ).data as APIGuild[];
                const guilds = guildres.map((g) => ({
                    id: g.id,
                    icon: g.icon ?? "",
                    name: g.name,
                    owns: g.owner ?? false,
                    permissions: g.permissions ?? 0,
                })) as Prisma.Enumerable<Prisma.WebUserInGuildCacheCreateManyUserInput>;

                if (profile.avatar === null) {
                    const defaultAvatarNumber =
                        parseInt(profile.discriminator) % 5;
                    profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
                } else {
                    const format = profile.avatar.startsWith("a_")
                        ? "gif"
                        : "png";
                    profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
                }

                return {
                    id: profile.id,
                    name: profile.username,
                    email: profile.email,
                    image: profile.image_url,
                    guilds: {
                        createMany: {
                            data: guilds,
                        },
                    },
                };
            },
        }),
    ],
    adapter: PrismaAdapter(prisma),
    callbacks: {
        async session({ session: s, user: u }) {
            return { ...s, user: { ...s.user, id: u.id } };
        },
    },
});
