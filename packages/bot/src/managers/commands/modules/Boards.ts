import BoardCommand from "src/managers/commands/modules/board/Board";
import Module from "src/managers/commands/structures/Module";

export default class BoardsModule extends Module {
    constructor() {
        super("boards");
    }

    load() {
        this.registerCommand(new BoardCommand());
    }
}
