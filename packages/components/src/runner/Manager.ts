import { ComponentInfo } from "../components/info";
import Component from "../components/Component";

export interface ManagerOptions {
    initiallyEnabled?: boolean;
}

export default class Manager {
    options: ManagerOptions;

    components: Map<number, ComponentInfo> = new Map();
    private lastId = -1;

    constructor(options: ManagerOptions, ...components: Component[]) {
        this.options = options;

        for (const component of components) {
            component.id = this.lastId + 1;
            if (typeof component.manager !== "undefined") {
                throw new Error(
                    `Component already registered. ID: ${
                        component.id
                    }, index in array: ${components.indexOf(component)}`,
                );
            }
            component.manager = this;
            this.components.set(component.id, {
                enabled: !!this.options.initiallyEnabled,
                component: component,
                type: component.type,
            });
        }
    }
}
