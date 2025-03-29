import { PacketDown } from "../../packet.js";
export default class SetConfig2 implements PacketDown {
    readonly id = 80;
    readonly name = "SetConfig2";
    constructor(view: DataView) {
        // TODO: Implement
    }
}