import { TRPCError } from "@trpc/server";
import axios from "axios";
import { createRouter } from "src/lib/api/router/context";

export const userRouter = createRouter().query("guilds", {
    resolve: async (ctx) => {
        if (!ctx.ctx.session || !ctx.ctx.session.accessToken)
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Not authenticated",
            });

        const guildres = await axios.get(
            "https://discord.com/api/users/@me/guilds",
            {
                headers: {
                    authorization: "Bearer " + ctx.ctx.session.accessToken,
                },
            },
        );

        console.log(guildres);

        return "hey";
    },
});
