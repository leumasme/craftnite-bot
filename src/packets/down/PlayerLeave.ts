import { PacketDown } from "../../packet";

export default class PlayerLeave implements PacketDown {
    id = 23;
    name = "PlayerLeave";
    playerId: number;

    constructor(view: DataView) {
        this.playerId = view.getUint8(1);
    }
}