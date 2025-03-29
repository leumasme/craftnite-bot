import { PacketUp } from "../../packet";

export default class SendChat implements PacketUp {
    readonly id = 27;
    readonly name = "SendChat";
    message = "";
    toBuffer(): ArrayBuffer {
        let buf = new ArrayBuffer(1 + 2 * this.message.length);
        let view = new DataView(buf);
        view.setUint8(0, this.id);
        for (let i = 0; i < this.message.length; i++) {
            view.setUint16(1 + i * 2, this.message.charCodeAt(i), true);
        }
        return buf;
    }
}