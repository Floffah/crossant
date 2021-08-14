import ManagersManager from "../../ManagersManager";
import CommandsManager from "../CommandsManager";
import BaseCommand from "./BaseCommand";

export default class Module {
    commands: string[] = [];

    name: string;
    managers: ManagersManager;

    constructor(name: string) {
        this.name = name;
    }

    registerCommand(c: BaseCommand) {
        const cmds = this.managers.managers.get("commands") as
            | CommandsManager
            | undefined;
        if (!cmds) throw new Error("No commands manager");
        cmds.registerCommand(this, c);
    }

    load() {
        // load
    }

    ready() {
        // ready
    }
}
