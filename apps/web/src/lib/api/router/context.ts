import { inferAsyncReturnType, router } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { prisma } from "src/lib/api/db";

export async function createContext(c: CreateNextContextOptions) {
    const nextauthsession = (await getSession({ req: c.req })) as Session & {
        user: Session["user"] & { id: string };
    };

    let session = undefined;

    if (nextauthsession && nextauthsession.user) {
        session =
            (await prisma.session.findFirst({
                where: {
                    expires: nextauthsession.expires,
                    user: {
                        id: nextauthsession.user.id,
                    },
                },
                include: {
                    user: {
                        include: {
                            guilds: true,
                        },
                    },
                },
            })) ?? undefined;
    }

    return {
        db: prisma,
        session,
    };
}

export type APIContext = inferAsyncReturnType<typeof createContext>;

export function createRouter() {
    return router<APIContext>();
}
