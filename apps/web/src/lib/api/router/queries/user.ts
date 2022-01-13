import { TRPCError } from "@trpc/server";
import { createRouter } from "src/lib/api/router/context";

export const userRouter = createRouter().query("guilds", {
    resolve: async (ctx) => {
        if (!ctx.ctx.session)
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Not authenticated as a user",
            });

        return "hey";
    },
});
