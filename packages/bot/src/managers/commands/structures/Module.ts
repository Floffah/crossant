import ManagersManager from "../../ManagersManager";
import CommandsManager from "../CommandsManager";
import BaseCommand from "./BaseCommand";

export default abstract class Module {
    commands: string[] = [];

    name: string;
    managers: ManagersManager;

    protected constructor(name: string) {
        this.name = name;
    }

    protected registerCommand(c: BaseCommand) {
        const cmds = this.managers.managers.get("commands") as
            | CommandsManager
            | undefined;
        if (!cmds) throw new Error("No commands manager");
        cmds.registerCommand(this, c);
    }

    abstract load?(): void | Promise<void>;

    ready(): void | Promise<void> {
        // to make optional
    }
}
