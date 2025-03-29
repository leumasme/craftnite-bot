import { PacketDown } from "../../packet.js";
import { log } from "../../terminal.js";

export default class Die implements PacketDown {
    readonly id = 19;
    readonly name = "Die";
    constructor(view: DataView) {
        // ... no data
        if (view.byteLength > 1) {
            log("Die: unexpected data".red, view.byteLength.toString());
        }
    }
}