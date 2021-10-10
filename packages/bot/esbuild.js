// this is a file for testing esbuild's sourcemap issues
const { build } = require("esbuild");

build({
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
        "mustache",
    ],
    // splitting: true,
    bundle: true,
    target: "node16",
    sourcemap: true,
    outdir: "./dist",
    platform: "node",
    minify: true,
});
