import { readFile } from "fs/promises"
import { parse } from "prismarine-nbt";
import { MC_MAPPINGS } from "./data.js";
import { log } from "./terminal.js";

const INVALID_NBT = new Error("Invalid NBT");
export async function loadNbt(name: string) {
    let file = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    let data = await readFile(`./saves/${file}.nbt`);
    console.time("parse")
    let parsed = await parse(data);
    console.timeEnd("parse")
    return parsed;
}
export type Block = {
    x: any;
    y: any;
    z: any;
    block: number;
}
export async function loadSave(name: string) {
    let nbt = await loadNbt(name);
    let palette = nbt.parsed.value.palette;
    if (palette?.type != "list") throw INVALID_NBT;
    if (palette.value.type != "compound") throw INVALID_NBT;
    let mapping = Object.fromEntries(palette.value.value.map((entry: any, idx) => {
        let mcId = entry.Name.value as string;
        mcId = mcId.split(":")[1]

        if (!(mcId in MC_MAPPINGS)) {
            log(`Unknown block: ${mcId}`.red);
        }

        return [idx, MC_MAPPINGS[mcId]];
    }))

    let blocks = nbt.parsed.value.blocks;
    if (blocks?.type != "list") throw INVALID_NBT;
    if (blocks.value.type != "compound") throw INVALID_NBT;
    let generated = blocks.value.value.map((entry: any) => {
        let id = entry.state.value as number;
        let block = mapping[id];
        if (!block) return undefined;
        let [x, y, z] = entry.pos.value.value;
        return { x, y, z, block };
    }).filter((x): x is Exclude<typeof x, undefined> => x != undefined);

    return generated;
}