const execa = require("execa");
const { doBuild } = require("./buildfn");
const { resolve } = require("path");
const { existsSync } = require("fs");

require("dotenv").config();

(async () => {
    if (existsSync(resolve(__dirname, "PROD"))) {
        await execa.command("yarn", {
            cwd: process.cwd(),
            stdio: "inherit",
        });
        process.env.DATABASE_URL = process.env.PROD_DB_URL;
        console.log(process.env.PROD_DB_URL);
        await execa.command("yarn prisma migrate deploy", {
            cwd: process.cwd(),
            stdio: "inherit",
            env: process.env,
        });
        await execa.command("yarn prisma generate", {
            cwd: process.cwd(),
            stdio: "inherit",
            env: process.env,
        });
    }

    if (!existsSync(resolve(__dirname, "dist", "crossant.js"))) {
        await doBuild();
    }

    require("./dist/crossant");
})();
