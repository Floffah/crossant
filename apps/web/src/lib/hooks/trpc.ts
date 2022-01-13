import { createReactQueryHooks } from "@trpc/react";
import { AppRouter } from "src/lib/api/router";

export const trpc = createReactQueryHooks<AppRouter>();
