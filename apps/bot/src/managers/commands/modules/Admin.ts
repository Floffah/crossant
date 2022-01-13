import ConfigCommand from "src/managers/commands/modules/admin/Config";
import SetupCommand from "src/managers/commands/modules/admin/Setup";
import Module from "src/managers/commands/structures/Module";

export default class AdminModule extends Module {
    constructor() {
        super("admin");
    }

    load() {
        this.registerCommand(new ConfigCommand(), new SetupCommand());
    }
}
