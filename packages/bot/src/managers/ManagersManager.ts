import Crossant from "../bot/Crossant";
import Manager from "./Manager";
import { EventEmitter } from "events";
import TypedEventEmitter from "typed-emitter";
import CommandsManager from "./commands/CommandsManager";

export interface ManagersManagerEvents {
    load: () => void;
}

const TypedEmitter = EventEmitter as {
    new (): TypedEventEmitter<ManagersManagerEvents>;
};

class ManagersManager extends TypedEmitter {
    bot: Crossant;

    managers: Map<string, Manager> = new Map();

    constructor(bot: Crossant) {
        super();
        this.bot = bot;
    }

    async startManagers() {
        const raw: { new (manager: ManagersManager): Manager }[] = [
            CommandsManager,
        ];

        for (const manager of raw) {
            const m = new manager(this);
            this.managers.set(m.name, m);

            this.bot.logger.info(`Loaded ${m.name} manager`);
        }

        this.emit("load");
    }
}

export default ManagersManager;
