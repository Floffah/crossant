import Module from "../structure/Module";
import State from "./dev/State";

export default class Dev extends Module {
    constructor() {
        super("dev");
    }

    load() {
        this.registerCommand(new State());
    }
}
