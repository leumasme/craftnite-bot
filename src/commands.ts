import { Client } from "./client.js";
import { BLOCK_IDS } from "./data.js";
import { clients } from "./index.js";
import { loadSave } from "./minecraft.js";
import SetBlocks from "./packets/up/SetBlocks.js";
import { log } from "./terminal.js";
import { blockToWorldCoords, coordsToSendable } from "./utils.js";
import { once } from "events"

export let enableCommands = true;

const restrictCommands = false

export async function execCommand(client: Client, playerId: number, msg: string) {
    if (!msg.startsWith("/")) return false;
    let player = client.players.find(p => p.playerId == playerId);
    if (!player) {
        log("!? Command sent by non-existent player".bgRed);
        return true;
    }
    let args = msg.slice(1).split(" ");
    log("Running Command Handler for " + args[0]);
    if (args[0] == "die") {
        client.dealDamage(playerId, 100);
        return true
    }
    if (args[0] == "pos") {
        if (!player.posX || !player.posY || !player.posZ) {
            client.sendChat("[BOT] I don't know where you are...")
            return true;
        }
        let { posX, posY, posZ } = player;
        let data = coordsToSendable(posX, posY, posZ)
        client.sendChat(`[World]: ${posX}; ${posY}; ${posZ}\n` +
            `[Chunk]: ${data.cx}; ${data.cy}; ${data.cz}\n` +
            `[Local]: ${data.lx}; ${data.ly}; ${data.lz}\n` +
            `[Index]: ${data.index}`)
        return true;
    }
    if (args[0] == "palette") {
        if (restrictCommands && player.username.toLowerCase() != "tex") {
            log(`Unauthorized User: ${player.username}`.red);
            return false;
        }
        let { posX, posY, posZ } = player;
        if (!player.posX || !player.posY || !player.posZ) {
            client.sendChat("[BOT] I don't know where you are...")
            return false;
        }
        let packet = new SetBlocks();

        let width = 32;
        for (let i = 0; i < BLOCK_IDS.length; i++) {
            let x = i % width;
            let z = Math.floor(i / width);
            let data = coordsToSendable(posX! + x * 5, posY! + 3 * 5, posZ! + z * 5)
            packet.coordX.push(data.cx);
            packet.coordY.push(data.cy);
            packet.coordZ.push(data.cz);
            packet.blockId.push(parseInt(BLOCK_IDS[i]));
            packet.localIdx.push(data.index);
        }
        client.ws.send(packet.toBuffer());
        return true;
    }
    if (args[0] == "slime" || args[0] == "ice") {
        if (restrictCommands && player.username.toLowerCase() != "tex") {
            log(`Unauthorized User: ${player.username}`.red);
            return false;
        }
        if (!player.posX || !player.posY || !player.posZ) {
            client.sendChat("[BOT] I don't know where you are...")
            return false;
        }
        let { posX, posY, posZ } = player;
        let packet = new SetBlocks();

        for (let i = 0; i < 50 * 50; i++) {
            let x = i % 50;
            let z = Math.floor(i / 50);
            let data = coordsToSendable(posX! + x * 5, posY! + 3 * 5, posZ! + z * 5)
            packet.coordX.push(data.cx);
            packet.coordY.push(data.cy);
            packet.coordZ.push(data.cz);
            packet.localIdx.push(data.index);
        }
        packet.blockId = new Array(packet.coordX.length).fill(args[0] == "slime" ? 42240 : 20224);

        client.ws.send(packet.toBuffer());
        return true;
    }
    if (args[0] == "set" && player.username.toLowerCase() == "tex") {
        let packet = new SetBlocks();
        let id = parseInt(args[1]);
        if (!player.posX || !player.posY || !player.posZ) {
            client.sendChat("[BOT] I don't know where you are...")
            return false;
        }
        let data = coordsToSendable(player.posX, player.posY + 3 * 5, player.posZ)
        packet.coordX.push(data.cx);
        packet.coordY.push(data.cy);
        packet.coordZ.push(data.cz);
        packet.blockId.push(id);
        packet.localIdx.push(data.index);
        client.ws.send(packet.toBuffer());
        return true;
    }
    if (args[0] == "load" && player.username.toLowerCase() == "tex") {
        let packet = new SetBlocks();
        if (!player.posX || !player.posY || !player.posZ) {
            client.sendChat("[BOT] I don't know where you are...")
            return false;
        }
        log("Loading save...");
        try {
            var structure = await loadSave(args[1]);
        } catch (e) {
            client.sendChat(`[BOT] Error loading save: ${e}`);
            return true;
        }
        log("Loaded save! Building packet...");
        for (let block of structure) {
            let { x: bx, y: by, z: bz } = blockToWorldCoords(block.x, block.y, block.z)
            let data = coordsToSendable(player.posX + bx, player.posY + by, player.posZ + bz)
            packet.coordX.push(data.cx);
            packet.coordY.push(data.cy);
            packet.coordZ.push(data.cz);
            packet.blockId.push(block.block);
            packet.localIdx.push(data.index);
        }
        let blockLimit = parseInt(args[2]) || 4000;
        let maxSplits = parseInt(args[3]) || Infinity;
        let delay = parseInt(args[4]) || 9000;
        log("Packet built! Sending Split Packets for " + packet.coordX.length + " blocks...");
        // if the packet is too big, split it up
        if (packet.coordX.length > blockLimit) {
            let splitPacket = new SetBlocks();
            let split = Math.min(Math.ceil(packet.coordX.length / blockLimit), maxSplits);

            await client.createSlaves(Math.min((packet.coordX.length / blockLimit) - client.slaves.length, 50));
            log("Found " + client.slaves.length + " clients use for load!");

            for (let i = 0; i < split; i++) {
                splitPacket.coordX = packet.coordX.slice(i * blockLimit, (i + 1) * blockLimit);
                splitPacket.coordY = packet.coordY.slice(i * blockLimit, (i + 1) * blockLimit);
                splitPacket.coordZ = packet.coordZ.slice(i * blockLimit, (i + 1) * blockLimit);
                splitPacket.blockId = packet.blockId.slice(i * blockLimit, (i + 1) * blockLimit);
                splitPacket.localIdx = packet.localIdx.slice(i * blockLimit, (i + 1) * blockLimit);
                let c = client.slaves[i % client.slaves.length];
                c.ws.send(splitPacket.toBuffer());
                log("Sending Packet for " + splitPacket.coordX.length + " blocks on slave " + ((i % client.slaves.length) + 1));

                // wait after each slave array cycle
                await new Promise(r => setTimeout(r, delay / client.slaves.length));
            }
        } else {
            client.ws.send(packet.toBuffer());
        }
        return true;
    }
    return false
}