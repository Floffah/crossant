import Module from "../structure/Module";
import Unfortunate from "./random/Unfortunate";

export default class Random extends Module {
    constructor() {
        super("random");
    }

    load() {
        this.registerCommand(new Unfortunate());
    }
}
