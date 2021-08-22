import { ManagerNames } from "src/managers/commands/managers";
import ManagersManager from "../../ManagersManager";
import BaseCommand from "./BaseCommand";

export default abstract class Module {
    commands: string[] = [];

    name: string;
    managers: ManagersManager;

    protected constructor(name: string) {
        this.name = name;
    }

    protected registerCommand(...commands: BaseCommand[]) {
        const cmds = this.managers.get(ManagerNames.CommandsManager);
        if (!cmds) throw new Error("No commands manager");
        for (const c of commands) {
            cmds.registerCommand(this, c);
        }
    }

    abstract load?(): void | Promise<void>;

    ready(): void | Promise<void> {
        // to make optional
    }
}
