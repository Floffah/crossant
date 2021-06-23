import { readFileSync } from "fs";

const execa = require("execa");
const { resolve } = require("path");
const { existsSync } = require("fs");
const { parse } = require("flatted");

require("dotenv").config();

(async () => {
    let state = {};

    if (existsSync(resolve(__dirname, "data", "state.json"))) {
        state = parse(
            readFileSync(resolve(__dirname, "data", "state.json"), "utf-8"),
        );
    }

    if (state.pull) {
        await execa.command("git pull");
        process.exit();
    }

    if (existsSync(resolve(__dirname, "PROD"))) {
        process.env.NODE_ENV = "production";

        await execa.command("yarn", {
            cwd: process.cwd(),
            stdio: "inherit",
            env: process.env,
        });
        process.env.DATABASE_URL = process.env.PROD_DB_URL;
        console.log(process.env.PROD_DB_URL);
        await execa.command("yarn workspace crossant prisma migrate deploy", {
            cwd: process.cwd(),
            stdio: "inherit",
            env: process.env,
        });
        await execa.command("yarn workspace crossant prisma generate", {
            cwd: process.cwd(),
            stdio: "inherit",
            env: process.env,
        });
    } else {
        process.env.NODE_ENV = "development";
    }

    await execa.command("build build", {
        cwd: process.cwd(),
        stdio: "inherit",
        env: process.env,
    });

    require("./packages/bot/dist/crossant");
})();
