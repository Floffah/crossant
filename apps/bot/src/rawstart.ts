#!/usr/bin/env node
import "source-map-support/register";
import Crossant from "./bot/Crossant";

new Crossant().init({
    debug:
        process.argv.includes("--debug") ||
        process.env.NODE_ENV === "development",
});
