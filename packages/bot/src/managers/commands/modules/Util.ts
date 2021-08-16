import Module from "../structures/Module";
import HelpCommand from "./util/Help";

export default class UtilModule extends Module {
    constructor() {
        super("util");
    }

    load(): void | Promise<void> {
        this.registerCommand(new HelpCommand());
    }
}
