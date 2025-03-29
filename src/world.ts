import { blockCoordsToChunkIndex, blockCoordsToChunkLocal, chunkLocalToInt } from "./utils";

export class World {
    readonly chunks: Chunk[][][] = [];
    readonly snapshotData = new Map<Chunk, Uint16Array>();
    defaultEmptyChunks = true;
    setChunkBlocks(x: number, y: number, z: number, blocks: Uint16Array) {
        if (!this.chunks[x]) this.chunks[x] = [];
        if (!this.chunks[x][y]) this.chunks[x][y] = [];
        if (!this.chunks[x][y][z]) this.chunks[x][y][z] = new Chunk(x, y, z, blocks);
        this.chunks[x][y][z].blocks = blocks;
    }
    startEdit() {
        this.snapshotData.clear();
    }
    endEdit() {
        let chunkX: number[] = [];
        let chunkY: number[] = [];
        let chunkZ: number[] = [];
        let localIdx: number[] = [];
        let blockId: number[] = [];
        for (let [chunk, old] of this.snapshotData) {
            let { blockId: _blockId, localIdx: _localIdx } = chunk.generateUpdate(old);
            blockId = blockId.concat(_blockId);
            localIdx = localIdx.concat(_localIdx);
            chunkX.push(chunk.x);
            chunkY.push(chunk.y);
            chunkZ.push(chunk.z);
        }
        this.snapshotData.clear();
        return {
            chunkX, chunkY, chunkZ,
            localIdx, blockId
        }
    }
    setAt(x: number, y: number, z: number, block: number) {
        let { x: cx, y: cy, z: cz } = blockCoordsToChunkIndex(x, y, z);
        let chunk = this.chunks[cx]?.[cy]?.[cz]
        if (!chunk) {
            if (this.defaultEmptyChunks) {
                this.setChunkBlocks(cx, cy, cz, new Uint16Array(32 * 32 * 32));
            } else return false;
        }

        if (!this.snapshotData.has(chunk)) {
            this.snapshotData.set(chunk, new Uint16Array(chunk.blocks));
        }

        let { x: lx, y: ly, z: lz } = blockCoordsToChunkLocal(x, y, z);
        chunk.blocks[chunkLocalToInt(lx, ly, lz)] = block;
        return true;
    }
    getAt(x: number, y: number, z: number) {
        let { x: cx, y: cy, z: cz } = blockCoordsToChunkIndex(x, y, z);
        let chunk = this.chunks[cx]?.[cy]?.[cz]
        if (!chunk) return this.defaultEmptyChunks ? 0 : false;

        let { x: lx, y: ly, z: lz } = blockCoordsToChunkLocal(x, y, z);
        return chunk.blocks[chunkLocalToInt(lx, ly, lz)];
    }
    getChunkByWorldCoords(x: number, y: number, z: number) {
        let { x: cx, y: cy, z: cz } = blockCoordsToChunkIndex(x, y, z);
        return this.chunks[cx]?.[cy]?.[cz];
    }
}

export class Chunk {
    blocks: Uint16Array;
    constructor(public readonly x: number, public readonly y: number, public readonly z: number,
        blocks?: Uint16Array) {
        this.blocks = blocks ?? new Uint16Array(32 * 32 * 32);
    }
    static from(blockTypes: number[], blockAmounts: number[]) {
        let blocks = new Uint16Array(32 * 32 * 32);
        let index = 0;
        for (let i = 0; i < blockTypes.length; i++) {
            let type = blockTypes[i];
            let amount = blockAmounts[i];
            for (let j = 0; j < amount; j++) {
                blocks[index] = type;
                index++;
            }
        }
    }
    atCoords(x: number, y: number, z: number) {
        return this.blocks[x + y * 32 + z * 32 * 32];
    }
    snapshot() {
        // clone blocks array efficiently
        return new Uint16Array(this.blocks);
    }
    diff(snapshot: Uint16Array) {
        let diff = []
        for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i] !== snapshot[i]) {
                diff.push(i);
            }
        }
        return diff;
    }
    generateUpdate(snapshot: Uint16Array) {
        // Generate SetBlocks data to send to server
        let diff = this.diff(snapshot);
        let localIdx = diff;
        let blockId = [];
        for (let i = 0; i < diff.length; i++) {
            blockId.push(this.blocks[diff[i]]);
        }
        return {
            localIdx,
            blockId
        }
    }
}