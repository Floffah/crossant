import ManagersManager from "./ManagersManager";

export default abstract class Manager {
    managers: ManagersManager;
    name: string;

    protected constructor(managers: ManagersManager, name: string) {
        this.managers = managers;
        this.name = name;
    }
}
