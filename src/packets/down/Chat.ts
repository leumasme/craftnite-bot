import { PacketDown } from "../../packet.js";
export default class Chat implements PacketDown {
    readonly id = 28;
    readonly name = "Chat";
    message;
    authorId;
    constructor(view: DataView) {
        this.authorId = view.getUint8(1);
        let arr = new Uint16Array(view.buffer.slice(2));
        this.message = String.fromCharCode.apply(null, arr as any);
    }
}