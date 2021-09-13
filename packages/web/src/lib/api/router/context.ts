import { inferAsyncReturnType, router } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/dist/declarations/src/adapters/next";
import { prisma } from "src/lib/api/db";

export async function createContext(_c: CreateNextContextOptions) {
    return {
        db: prisma,
    };
}

export type APIContext = inferAsyncReturnType<typeof createContext>;

export function createRouter() {
    return router<APIContext>();
}
