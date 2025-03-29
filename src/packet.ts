import Chat from "./packets/down/Chat.js";
import Die from "./packets/down/Die.js";
import Disconnect from "./packets/down/Disconnect.js";
import HelloDown from "./packets/down/Hello.js";
import MoveOther from "./packets/down/MoveOther.js";
import PlayerJoin from "./packets/down/PlayerJoin.js";
import PlayerLeave from "./packets/down/PlayerLeave.js";
import SetConfig1 from "./packets/down/SetConfig1.js";
import SetConfig2 from "./packets/down/SetConfig2.js";
import SetOceanHeight from "./packets/down/SetOceanHeight.js";
import SetPlayerCreative from "./packets/down/SetPlayerCreative.js";
import Spawn from "./packets/down/Spawn.js";
import UpdateScore from "./packets/down/UpdateScore.js";
import DealDamage from "./packets/up/DealDamage.js";
import HelloUp from "./packets/up/Hello.js";
import Move from "./packets/up/Move.js";
import RequestRespawn from "./packets/up/RequestRespawn.js";
import SendChat from "./packets/up/SendChat.js";
import SetBlocks from "./packets/up/SetBlocks.js";

export interface Packet {
    readonly id: number;
    readonly name: string;
}
export abstract class PacketUp implements Packet {
    id!: number;
    name!: string;
    abstract toBuffer(): ArrayBuffer;
}

export abstract class PacketDown implements Packet {
    id!: number;
    name!: string;
    constructor(view: DataView) {}
}

export const Packets = {
    // Client -> Server
    1: HelloUp,
    3: Move,
    16: DealDamage,
    20: RequestRespawn,
    27: SendChat,
    70: SetBlocks,

    // Server -> Client
    0: HelloDown, // 1. in Join 
    2: PlayerJoin,
    4: MoveOther,
    14: SetConfig1, // 4. in Join 
    19: Die,
    21: Spawn,
    23: PlayerLeave,
    28: Chat,
    50: Disconnect,
    79: SetOceanHeight, // 2. in Join 
    80: SetConfig2, // 5. in Join 
    81: SetPlayerCreative, // 3. in Join
    85: UpdateScore,
} as { [id: number]: new(...args: any[]) => Packet };