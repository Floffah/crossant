import { readdirSync, statSync } from "fs";
import { resolve } from "path";

export function getMoreRecentlyEdited(
    folder: string,
    gt: number | Date,
): null | { time: number; path: string } {
    if (gt instanceof Date) gt = gt.getTime();

    const files = readdirSync(folder);

    for (const file of files) {
        const filepath = resolve(folder, file);
        const stat = statSync(filepath);

        if (stat.isDirectory()) {
            const recursive = getMoreRecentlyEdited(filepath, gt);
            if (recursive !== null) return recursive;
        } else if (stat.mtimeMs > gt)
            return { time: stat.mtimeMs, path: filepath };
    }

    return null;
}
