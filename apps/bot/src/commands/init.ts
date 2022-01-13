import chalk from "chalk";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { parse, stringify } from "ini";
import { resolve } from "path";
import { defaultConfig } from "src/config/config";

export default async function initCommand() {
    const datadir = resolve(process.cwd(), ".crossant");
    if (!existsSync(datadir)) mkdirSync(datadir, { recursive: true });

    const configpath = resolve(datadir, "config.ini");
    const config = {
        ...defaultConfig,
        ...(existsSync(configpath)
            ? parse(readFileSync(configpath, "utf-8"))
            : {}),
    };

    writeFileSync(configpath, stringify(config));
    console.log(chalk`{green Wrote default config}`);
}
