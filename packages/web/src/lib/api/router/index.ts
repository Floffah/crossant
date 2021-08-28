import { createRouter } from "src/lib/api/router/context";

export const appRouter = createRouter();

export type AppRouter = typeof appRouter;
