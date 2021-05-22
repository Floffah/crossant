import Module from "../structure/Module";
import Order from "./bar/Order";

export default class Bar extends Module {
    constructor() {
        super("bar");
    }

    load() {
        this.registerCommand(new Order());
    }
}
