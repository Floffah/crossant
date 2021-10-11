import { inferAsyncReturnType, router } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getSession } from "next-auth/client";
import { prisma } from "src/lib/api/db";
import { Session } from "next-auth";

export async function createContext(c: CreateNextContextOptions) {
    const session = (await getSession({ req: c.req })) as Session & {
        user: Session["user"] & { id: string };
    };

    let account = undefined;

    if (session && session.user) {
        account = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                providerId: "discord",
            },
            include: {
                user: true,
            },
        });
    }

    return {
        db: prisma,
        session,
        account,
    };
}

export type APIContext = inferAsyncReturnType<typeof createContext>;

export function createRouter() {
    return router<APIContext>();
}
