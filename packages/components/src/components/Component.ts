import Manager from "../runner/Manager";
import SubManager from "../runner/SubManager";

export default class Component {
    manager: Manager | SubManager;
    id: number;
    type: string;

    constructor(type: string) {
        this.type = type;
    }

    get enabled() {
        const component = this.manager.components.get(this.id);
        if (!component)
            throw new Error(
                "This component has not been registered as a child to any manager yet.",
            );

        return component.enabled;
    }
}
