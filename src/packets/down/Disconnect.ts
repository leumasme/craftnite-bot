import { PacketDown } from "../../packet";

export default class Disconnect implements PacketDown {
    readonly id = 50;
    readonly name = "Disconnect";
    constructor(_: DataView) { }
}