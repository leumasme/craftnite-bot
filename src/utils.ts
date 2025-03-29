import { Player } from "./client";

export function getUniqueName(p: Player, colorful?: string, ugly: boolean = false) {
    let name = cleanString(colorful ?? p.username);
    if (p.username == "unnamed") {
        let id = p.playerId.toString().padStart(2, "0");
        if (!ugly) id = id.cyan;
        return `${name}${id}`;
    }
    return name;
}

export function cleanString(str: string) {
    return str.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '#');
}

export function blockCoordsToChunkIndex(x: number, y: number, z: number) {
    return {
        x: Math.floor(x / 32),
        y: Math.floor(y / 32),
        z: Math.floor(z / 32)
    };
}

export function blockCoordsToChunkLocal(x: number, y: number, z: number) {
    return {
        x: Math.floor(x % 32),
        y: Math.floor(y % 32),
        z: Math.floor(z % 32)
    };
}

export function chunkLocalToInt(x: number, y: number, z: number) {
    return x + y * 32 + z * 32 * 32;
}

export function worldToBlockCoords(x: number, y: number, z: number) {
    return {
        x: Math.floor(x / 5),
        y: Math.floor(y / 5),
        z: Math.floor(z / 5)
    };
}

export function blockToWorldCoords(x: number, y: number, z: number) {
    return {
        x: x * 5,
        y: y * 5,
        z: z * 5
    };
}

export function coordsToSendable(x: number, y: number, z: number) {
    let { x: bx, y: by, z: bz } = worldToBlockCoords(x, y, z);
    let { x: cx, y: cy, z: cz } = blockCoordsToChunkIndex(bx, by, bz);
    let { x: lx, y: ly, z: lz } = blockCoordsToChunkLocal(bx, by, bz);
    let index = chunkLocalToInt(lx, ly, lz);
    return {
        cx, cy, cz, index, lx, ly, lz
    };
}