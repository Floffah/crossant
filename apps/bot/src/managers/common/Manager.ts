import { ManagerNames } from "src/managers/common/managers";
import ManagersManager from "src/managers/common/ManagersManager";

export default abstract class Manager {
    managers: ManagersManager;
    name: ManagerNames;

    protected constructor(managers: ManagersManager, name: ManagerNames) {
        this.managers = managers;
        this.name = name;
    }
}
