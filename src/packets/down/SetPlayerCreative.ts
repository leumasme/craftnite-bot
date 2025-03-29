import { PacketDown } from "../../packet.js";
export default class SetPlayerCreative implements PacketDown {
    readonly id = 81;
    readonly name = "SetPlayerCreative";
    creative;
    constructor(view: DataView) {
        this.creative = view.getUint8(1);
    }
}