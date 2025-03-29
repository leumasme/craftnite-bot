import { PacketDown } from "../../packet.js";

export default class PlayerJoin implements PacketDown {
    id = 2;
    name = "PlayerJoin";
    playerId: number;
    skinId: number;
    score: number;
    username: string;
    constructor(view: DataView) {
        this.playerId = view.getUint8(1);
        this.skinId = view.getUint8(2);
        this.score = view.getUint32(3, true);
        // Decode UFT-16 string
        let arr = new Uint16Array(view.buffer.slice(7));
        this.username = String.fromCharCode.apply(null, arr as any);
    }
}