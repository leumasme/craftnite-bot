import { PacketUp } from "../../packet";

export default class Move implements PacketUp{
    readonly id = 3;
    readonly name = "Move";
    x?: number;
    y?: number;
    z?: number;
    time?: number;
    rotY?: number;
    rotX?: number;
    walking: boolean = false;
    
    toBuffer(): ArrayBuffer {
        if (!this.time) {
            let curr = Date.now() / 1000;
            let short = parseFloat(curr.toString().slice(4));
            this.time = short;
        }

        let buf = new ArrayBuffer(26);
        let view = new DataView(buf);
        view.setUint8(0, this.id);
        view.setFloat32(1, this.x!, true);
        view.setFloat32(5, this.y!, true);
        view.setFloat32(9, this.z!, true);
        view.setFloat32(13, this.time, true);
        view.setFloat32(17, this.rotX!, true);
        view.setFloat32(21, this.rotY!, true);
        view.setUint8(25, +this.walking);
        return buf;
    }
}