import { inferAsyncReturnType, router } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/dist/declarations/src/adapters/next";
import { getSession } from "next-auth/client";
import { prisma } from "src/lib/api/db";

export async function createContext(c: CreateNextContextOptions) {
    const session = await getSession({ req: c.req });

    return {
        db: prisma,
        session,
    };
}

export type APIContext = inferAsyncReturnType<typeof createContext>;

export function createRouter() {
    return router<APIContext>();
}
