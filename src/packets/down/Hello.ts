import { PacketDown } from "../../packet.js";
export default class Hello implements PacketDown {
    readonly id = 0;
    readonly name = "Hello";
    playerId: number;
    constructor(view: DataView) {
        this.playerId = view.getUint8(1);
    }
}