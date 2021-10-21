import DevCommand from "src/managers/commands/modules/dev/Dev";
import Module from "src/managers/commands/structures/Module";

export default class DevModule extends Module {
    constructor() {
        super("dev");
    }

    load() {
        this.registerCommand(new DevCommand());
    }
}
