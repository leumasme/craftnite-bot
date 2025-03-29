import { PacketDown } from "../../packet";

export default class Spawn implements PacketDown {
    readonly id = 21;
    readonly name = "Spawn";
    x: number;
    y: number;
    z: number;
    constructor(view: DataView) {
        this.x = view.getFloat32(1, true);
        this.y = view.getFloat32(5, true);
        this.z = view.getFloat32(9, true);
    }
}