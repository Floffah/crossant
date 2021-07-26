import { Options } from "tsup";

export const tsup: Options = {
    entryPoints: ["./src/index.ts", "./src/cli.ts", "./src/nocli.ts"],
    external: ["discord.js", "prisma", "@prisma/client"],
    clean: true,
    splitting: true,
    target: "node16",
    dts: false,
};
