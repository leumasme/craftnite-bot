import { PacketDown } from "../../packet.js";
export default class SetConfig1 implements PacketDown {
    readonly id = 14;
    readonly name = "SetConfig1";
    constructor(view: DataView) {
        // TODO: Implement
    }
}