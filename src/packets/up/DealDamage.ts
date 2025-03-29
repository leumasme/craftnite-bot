import { PacketUp } from "../../packet";

export default class DealDamage implements PacketUp {
    readonly id = 16;
    readonly name = "DealDamage";
    constructor(public userId: number, public damage: number) {}

    toBuffer(): ArrayBuffer {
        let buf = new ArrayBuffer(3);
        let view = new DataView(buf);
        
        // Clamp damage to uint8
        this.damage = Math.min(Math.max(this.damage, 0), 255);

        view.setUint8(0, this.id);
        view.setUint8(1, this.userId);
        view.setUint8(2, this.damage);
        return buf;
    }

}