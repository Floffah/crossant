#!/usr/bin/env node

import { program } from "commander";
import Crossant from "./bot/Crossant";
import initCommand from "./commands/init";
import { startShards } from "./util/shards";

const pkg = require("../package.json");

program.name(pkg.name).version(pkg.version).description(pkg.description);

program
    .command("init")
    .description("Initialise Crossant for running")
    .action(() => initCommand());

program
    .command("run")
    .description("Run crossant")
    .option("-d, --debug", "Start in debug mode")
    .option("-s, --no-shard", "Disable sharding")
    .action((opts) => {
        if (opts.debug) process.env.NODE_ENV = "development";
        if (opts.shard) {
            startShards();
        } else {
            new Crossant().init(opts);
        }
    });

program.parse(process.argv);
