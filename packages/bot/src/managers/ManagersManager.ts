import { EventEmitter } from "events";
import CacheManager from "src/managers/commands/CacheManager";
import { ManagerNames, ManagerTypes } from "src/managers/commands/managers";
import TypedEventEmitter from "typed-emitter";
import Crossant from "../bot/Crossant";
import CommandsManager from "./commands/CommandsManager";
import Manager from "./Manager";

export interface ManagersManagerEvents {
    load: () => void;
}

const TypedEmitter = EventEmitter as {
    new (): TypedEventEmitter<ManagersManagerEvents>;
};

class ManagersManager extends TypedEmitter {
    bot: Crossant;

    managers: Map<ManagerNames, Manager> = new Map();

    constructor(bot: Crossant) {
        super();
        this.bot = bot;
    }

    async startManagers() {
        const raw: { new (manager: ManagersManager): Manager }[] = [
            CommandsManager,
            CacheManager,
        ];

        for (const manager of raw) {
            const m = new manager(this);
            this.managers.set(m.name, m);

            this.bot.logger.info(`Loaded ${m.name} manager`);
        }

        this.emit("load");
    }

    get<Name extends ManagerNames>(name: Name): ManagerTypes[Name] | undefined {
        return this.managers.get(name) as ManagerTypes[Name] | undefined;
    }
}

export default ManagersManager;
