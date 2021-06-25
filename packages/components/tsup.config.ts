export const tsup = {
    ...require("../../common.build"),
    entryPoints: ["./src/index.ts"],
    external: [
        "ffmpeg-static",
        "discord.js",
        "prisma",
        "@prisma/client",
        "canvas",
        "chart.js",
    ],
};
