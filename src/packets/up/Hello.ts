import { PacketUp } from "../../packet";
let encoder = new TextEncoder();
export default class Hello implements PacketUp {
    readonly id = 1;
    readonly name = "Hello";
    username: string;
    skinId: number
    constructor(username: string, skinId: number) {
        this.username = username;
        this.skinId = skinId;
    }
    toBuffer(): ArrayBuffer {
        let buf = new ArrayBuffer(2 + 2 * this.username.length)
        let view = new DataView(buf);
        view.setUint8(0, this.id);
        view.setUint8(1, this.skinId);
        for (let i = 0; i < this.username.length; i++) {
            view.setUint16(2 + i * 2, this.username.charCodeAt(i), true);
        }
        return buf;
    }
}