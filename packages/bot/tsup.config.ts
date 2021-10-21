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
        "@pm2/*",
        "captcha-canvas",
        "canvas",
        "source-map-support",
    ],
    clean: true,
    splitting: false,
    bundle: true,
    target: "node16",
    dts: false,
    sourcemap: true,
};
