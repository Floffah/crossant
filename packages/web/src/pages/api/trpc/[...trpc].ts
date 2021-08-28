import { createNextApiHandler } from "@trpc/server/dist/declarations/src/adapters/next";
import { appRouter } from "src/lib/api/router";
import { createContext } from "src/lib/api/router/context";

export default createNextApiHandler({
    router: appRouter,
    createContext,
});
