import { PacketUp } from "../../packet";

export default class SetBlocks implements PacketUp {
    readonly id = 70;
    readonly name = "SetBlocks";
    coordX: number[] = [];
    coordY: number[] = [];
    coordZ: number[] = [];
    localIdx: number[] = [];
    blockId: number[] = [];
    toBuffer(): ArrayBuffer {
        if (!this.coordX || !this.coordY || !this.coordZ ||
            !this.localIdx || !this.blockId) {
            throw new Error("SetBlocks: required fields missing");
        }
        let buf = new ArrayBuffer(1 + 9 * this.coordX.length)
        let view = new DataView(buf)
        view.setUint8(0, this.id)
        let offset = 1;
        for (let i = 0; i < this.coordX.length; i++) {
            view.setUint8(offset, this.coordX[i])
            offset += 1;
            view.setUint8(offset, this.coordY[i])
            offset += 1;
            view.setUint8(offset, this.coordZ[i])
            offset += 1;
            view.setUint32(offset, this.localIdx[i], true)
            offset += 4;
            view.setUint16(offset, this.blockId[i], true)
            offset += 2;
        }
        return buf;
    }
}