import { parse, stringify } from "jju";
import { prisma } from "src/lib/api/db";

export class CacheProvider {
    async set(name: string, value: Record<any, any>) {
        const stringified = stringify(value, { mode: "json" });
        return await prisma.cache.upsert({
            where: {
                name,
            },
            create: {
                name,
                value: stringified,
            },
            update: {
                value: stringified,
            },
        });
    }

    async get(name: string) {
        const c = prisma.cache.findUnique({
            where: { name },
        });
        if (!c) return undefined;
        return parse(name, { mode: "json" });
    }
}

export const cache = new CacheProvider();

export const cacheNames = {};
