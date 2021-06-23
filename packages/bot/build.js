const { build } = require("estrella");

build({
    ...require("../../common.build"),
    entryPoints: ["./src/index.ts"],
    outfile: "./dist/crossant.js",
    external: [
        "ffmpeg-static",
        "discord.js",
        "prisma",
        "@prisma/client",
        "canvas",
        "chart.js",
    ],
});
