import { PacketDown, Packets } from "./packet.js";
import WebSocket from "ws";
import HelloDown from "./packets/down/Hello.js";
import ChatDown from "./packets/down/Chat.js";
import HelloUp from "./packets/up/Hello.js";
import PlayerJoin from "./packets/down/PlayerJoin.js";
import Move from "./packets/up/Move.js";
import EventEmitter from "events"
import TypedEmitter from "typed-emitter"
import PlayerLeave from "./packets/down/PlayerLeave.js";
import "colors";
import UpdateScore from "./packets/down/UpdateScore.js";
import { log } from "./terminal.js";
import SendChat from "./packets/up/SendChat.js";
import DealDamage from "./packets/up/DealDamage.js";
import MoveOther from "./packets/down/MoveOther.js";
import RequestRespawn from "./packets/up/RequestRespawn.js";
import { once } from "events";


export const SKINS = ["aladdin", "alice", "angel", "anonymous", "arcticFox", "army", "artist", "astronaut", "batman", "beaver", "blackWitch", "bobRoss", "burger", "buzzLightyear", "cactus", "canadianHockey", "captainAmerica", "cheerleader", "chicken", "cookieMonster", "coolGuy", "countryGirl", "cow", "cristianoRonaldo", "croco", "crosby", "deadpool", "dog", "donaldDuck", "donna", "duck", "duke", "electricPanda", "electricRobot", "elf", "elsa", "emilie", "eminem", "emo", "fbi", "fireFighter", "fox", "frankenstein", "frog", "geisha", "ghostWidow", "godfather", "gryffindor", "hippy", "homer", "horse", "hulk", "ironman", "jackSparrow", "jenny", "jesus", "joker", "karateKid", "kawaiiGirl", "lebronJames", "legendary", "lion", "lover", "luigi", "lukeSkywalker", "mario", "monkey", "monster", "monsterInc", "navy", "ninja", "ohMyGod", "owl", "parrot", "peach", "penguin", "pikachuGirl", "policeMan", "popCorn", "potatoMan", "queen", "rainbowHair", "redHead", "robinHood", "robot", "santa", "shrek", "skeleton", "skeletonPirate", "soulEater", "superman", "trooper", "trump", "viking", "vikingKing", "werewolf", "whiteDevil", "wonderWoman", "woody", "yeti", "yoshi", "zeus"];

export interface Player {
    username: string, score: number,
    skinId: number, playerId: number,
    posX?: number, posY?: number, posZ?: number,
}

export interface Events {
    "playerJoin": (player: Player) => void,
    "playerLeave": (player: Player) => void,
    "chat": (player: Player, message: string) => void,
    "connect": () => void,
    "ready": () => void,
    "disconnect": () => void,
}

export class Client extends (EventEmitter as new () => TypedEmitter<Events>) {
    instance: number;
    playerId?: number;
    ws!: WebSocket;
    players: Player[] = [];
    ready = false;
    antiAfkInterval?: NodeJS.Timer;

    slaves: Client[] = [];
    master?: Client;
    constructor(url: string, instance: number, private name = "Bot // Temm") {
        super();
        this.instance = instance;
        this.connect(url);
    }
    connect(url: string) {
        this.ws = new WebSocket(url);
        this.ws.binaryType = "arraybuffer";
        this.ws.addEventListener("open", () => {
            log("WebSocket connected");
            let view = new DataView(new ArrayBuffer(2));
            view.setUint8(0, 13);
            view.setUint8(1, 26);
            this.ws.send(view.buffer);
            this.emit("connect");
        });

        this.ws.addEventListener("message", event => {
            if (event.data instanceof ArrayBuffer) {
                let view = new DataView(event.data);
                let packetId = view.getUint8(0);
                this.onPacket(packetId, view);
            } else log("!? wrong datatype");
        });

        this.ws.addEventListener("close", e => {
            log("Socket Closed:".red.italic, e.reason, this.instance);
            this.ready = false;
            this.players = [];
            if (this.antiAfkInterval) clearInterval(this.antiAfkInterval);
            this.emit("disconnect");
        })
    }
    sendChat(message: string) {
        let p = new SendChat()
        p.message = message;
        this.ws.send(p.toBuffer());
    }
    dealDamage(playerId: number, damage: number) {
        if (playerId == this.playerId) return;
        let p = new DealDamage(playerId, damage);
        this.ws.send(p.toBuffer());
    }
    private onPacket(packetId: number, data: DataView) {
        if (!Packets[packetId]) {
            // log("Unknown packet id: " + packetId);
            return;
        }
        try {
            var packet = new Packets[packetId](data) as PacketDown;
        } catch (e) {
            console.error("Error while parsing packet: " + packetId, e, this.ws.url);
            console.error("Data", new Uint8Array(data.buffer).join(","));
            return
        }

        switch (packet.name) {
            case "Hello": {
                let hello = packet as HelloDown;
                this.playerId = hello.id;
                break;
            }
            case "SetConfig2": {
                let hello = new HelloUp(this.name + "§1.1.1.1", 70);
                this.ws.send(hello.toBuffer());
                break;
            }
            case "PlayerJoin": {
                let join = packet as PlayerJoin;
                this.players.push({
                    username: join.username,
                    score: join.score,
                    skinId: join.skinId,
                    playerId: join.playerId
                });
                if (join.playerId === this.playerId && !this.ready) {
                    this.ready = true;
                    this.emit("ready");
                } else {
                    this.emit("playerJoin", this.players[this.players.length - 1]);
                }
                break;
            }
            case "PlayerLeave": {
                let leave = packet as PlayerLeave;
                let player = this.players.find(p => p.playerId === leave.playerId);
                if (!player) {
                    log(`!? Non-Existent player left: ${leave.playerId}`.bgRed);
                    return;
                }
                this.emit("playerLeave", player!);
                this.players.splice(this.players.indexOf(player!), 1);
                break;
            }
            case "UpdateScore": {
                let score = packet as UpdateScore;
                let player = this.players.find(p => p.playerId === score.playerId);
                if (!player) {
                    log(`!? Non-Existent player score update: ${score.playerId}`.bgRed);
                    return;
                }
                player.score = score.score;
                if (player.playerId === this.playerId && score.score > 2) {
                    this.dealDamage(this.playerId, 200);
                }
                break;
            }
            case "MoveOther": {
                let move = packet as MoveOther;
                for (let i = 0; i < move.playerId.length; i++) {
                    let player = this.players.find(p => p.playerId === move.playerId[i]);
                    if (!player) return;
                    player.posX = move.posX[i];
                    player.posY = move.posY[i];
                    player.posZ = move.posZ[i];
                    if (player.username.includes("𐂃")) {
                        this.dealDamage(player.playerId, 200);
                    }
                }
                break;
            }
            case "Spawn": {
                let offsetX = Math.floor(Math.random() * 150);
                let offsetZ = Math.floor(Math.random() * 150);
                this.antiAfkInterval = setInterval(() => {
                    let move = new Move();
                    move.x = 3600 + offsetX;
                    move.y = 240;
                    move.z = 2900 + offsetZ;
                    move.rotX = Math.random() * 2 * Math.PI - Math.PI;
                    move.rotY = Math.random() * Math.PI - (Math.PI / 2);
                    this.ws.send(move.toBuffer());
                }, 500);
                break;
            }
            case "Chat": {
                let chat = packet as ChatDown;
                let player = this.players.find(x => x.playerId === chat.authorId);
                this.emit("chat", player!, chat.message);
                break;
            }
            case "Die": {
                log(`+++ Bot ${this.instance} died +++`.bgRed);
                this.ws.send(new RequestRespawn().toBuffer());
            }
            case "Disconnect": {
                // log("Disconnected...");
                break;
            }
            default: {
                log(`Unhandled packet: ${packet.name}`);
            }
        }
    }
    async createSlaves(amount: number) {
        if (this.master != null) throw "Slave can not create slaves";
        for (let i = 0; i < amount; i++) {
            let slave = new Client(this.ws.url, this.instance, "Slave " + i);
            slave.master = this;
            slave.connect(this.ws.url);
            this.slaves.push(slave);
            slave.on("disconnect", () => {
                this.slaves.splice(this.slaves.indexOf(slave), 1);
            })
        }
        await Promise.all(this.slaves.map(s => once(s, "ready")));
    }
}