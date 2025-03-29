import { PacketUp } from "../../packet.js";

export default class RequestRespawn implements PacketUp {
    readonly id = 20;
    readonly name = "RequestRespawn";
    toBuffer(): ArrayBuffer {
        let buf = new ArrayBuffer(1);
        let view = new DataView(buf);
        view.setUint8(0, this.id);
        return buf;
    }
}