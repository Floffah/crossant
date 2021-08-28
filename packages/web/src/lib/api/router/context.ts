import { inferAsyncReturnType, router } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/dist/declarations/src/adapters/next";

export async function createContext(_c: CreateNextContextOptions) {
    return {};
}

export type APIContext = inferAsyncReturnType<typeof createContext>;

export function createRouter() {
    return router<APIContext>();
}
