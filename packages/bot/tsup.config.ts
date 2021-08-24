import { Options } from "tsup";

export const tsup: Options = {
    entryPoints: ["./src/cli.ts", "./src/rawstart.ts", "./src/shardstart.ts"],
    external: [
        "discord.js",
        "@discordjs/*",
        "prisma",
        "@prisma/client",
        "winston",
        "terminal-kit",
    ],
    clean: true,
    splitting: true,
    bundle: true,
    target: "node16",
    dts: false,
    sourcemap: true,
};
