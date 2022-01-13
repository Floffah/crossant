import VerifyCommand from "src/managers/commands/modules/verification/Verify";
import Module from "src/managers/commands/structures/Module";

export default class VerificationModule extends Module {
    constructor() {
        super("verification");
    }

    load() {
        this.registerCommand(new VerifyCommand());
    }
}
