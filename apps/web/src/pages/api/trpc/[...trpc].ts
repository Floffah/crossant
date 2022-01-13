import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "src/lib/api/router";
import { createContext } from "src/lib/api/router/context";

export default createNextApiHandler({
    router: appRouter,
    createContext,
});
