import { PacketDown } from "../../packet.js";
export default class SetOceanHeight implements PacketDown {
    readonly id = 79;
    readonly name = "SetOceanheight";
    height;
    moveDuration;
    constructor(view: DataView) {
        this.height = view.getFloat32(1, true);
        this.moveDuration = view.getFloat32(5, true);
    }
}