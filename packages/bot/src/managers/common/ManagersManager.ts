import { EventEmitter } from "events";
import GuildManager from "src/managers/guilds/GuildManager";
import { ManagerNames, ManagerTypes } from "src/managers/common/managers";
import VerificationManager from "src/managers/verification/VerificationManager";
import TypedEventEmitter from "typed-emitter";
import Crossant from "src/bot/Crossant";
import CommandsManager from "src/managers/commands/CommandsManager";
import Manager from "src/managers/common/Manager";

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
            GuildManager,
            VerificationManager,
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
