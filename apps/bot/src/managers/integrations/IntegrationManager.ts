import Manager from "src/managers/common/Manager";
import { ManagerNames } from "src/managers/common/managers";
import ManagersManager from "src/managers/common/ManagersManager";

export default class IntegrationManager extends Manager {
    constructor(m: ManagersManager) {
        super(m, ManagerNames.IntegrationManager);

        this.managers.on("load", () => this.load());
    }

    async load() {}
}
