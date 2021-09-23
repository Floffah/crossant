import { createRouter } from "src/lib/api/router/context";
import { userRouter } from "src/lib/api/router/queries/user";

export const appRouter = createRouter().merge("user.", userRouter);

export type AppRouter = typeof appRouter;
