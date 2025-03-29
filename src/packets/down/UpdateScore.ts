import { PacketDown } from "../../packet";

export default class UpdateScore implements PacketDown {
    readonly id = 85;
    readonly name = "UpdateScore";
    playerId;
    score;
    constructor(view: DataView) {
        this.playerId = view.getUint8(1);
        this.score = view.getUint32(2, true);
    }
}