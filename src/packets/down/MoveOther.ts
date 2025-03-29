import { PacketDown } from "../../packet";

export default class MoveOther implements PacketDown {
    readonly id = 4;
    readonly name = "MoveOther";
    playerId = [] as number[];
    posX = [] as number[]; posY = [] as number[]; posZ = [] as number[];
    rotX = [] as number[]; rotY = [] as number[];
    time = [] as number[];
    walking = [] as number[];
    constructor(view: DataView) { 
        for (let x = 1; x < view.byteLength;) {
            this.playerId.push(view.getUint8(x)); x++;
            this.posX.push(view.getFloat32(x, true)); x += 4;
            this.posY.push(view.getFloat32(x, true)); x += 4;
            this.posZ.push(view.getFloat32(x, true)); x += 4;
            this.rotY.push(view.getFloat32(x, true)); x += 4;
            this.rotX.push(view.getFloat32(x, true)); x += 4;
            this.time.push(view.getFloat32(x, true)); x += 4;
            this.walking.push(view.getUint8(x)); x++;
        }
    }
}