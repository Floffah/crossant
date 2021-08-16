import { ManagerNames } from "src/managers/commands/managers";
import ManagersManager from "./ManagersManager";

export default abstract class Manager {
    managers: ManagersManager;
    name: ManagerNames;

    protected constructor(managers: ManagersManager, name: ManagerNames) {
        this.managers = managers;
        this.name = name;
    }
}
