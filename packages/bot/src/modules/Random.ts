import Module from "../structure/Module";
import Unfortunate from "./random/Unfortunate";
import Timezone from "./random/Timezone";

export default class Random extends Module {
    constructor() {
        super("random");
    }

    load() {
        this.registerCommand(new Unfortunate());
        this.registerCommand(new Timezone());
    }
}
