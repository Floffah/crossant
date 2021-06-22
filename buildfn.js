// eslint-disable-next-line @typescript-eslint/no-var-requires
const { build: buildfn } = require("estrella");

async function doBuild() {
    const dev =
        process.argv.includes("--watch") || process.argv.includes("--dev");

    await buildfn({
        bundle: true,
        target: "node16",
        platform: "node",
        watch: dev,
        color: true,
        logLevel: "info",
        minify: !dev,
        minifyIdentifiers: !dev,
        minifySyntax: !dev,
        minifyWhitespace: !dev,
        format: "cjs",
        entryPoints: ["./src/index.ts"],
        outfile: "./dist/crossant.js",
        external: [
            "ffmpeg-static",
            "discord.js",
            "prisma",
            "@prisma/client",
            "canvas",
        ],
        sourcemap: dev,
    });
}

module.exports = {
    doBuild,
};
