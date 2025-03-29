import { WebhookClient } from "discord.js";
import { readFileSync } from "fs";
import { exit } from "process";
import { Player } from "./client.js";
import { SKIN_IDS } from "./data.js";
import { log } from "./terminal.js";
import { getUniqueName } from "./utils.js";

export const webhooks: WebhookClient[] = [];
readFileSync("./webhooks.csv").toString().split("\n").map(l => {
    let [id, token] = l.split(",")
    webhooks.push(new WebhookClient({ id, token }, { allowedMentions: { parse: [] } }));
});

export async function sendToWebhook(num: number, msg: string, sender: Player) {
    await webhooks[num - 1].send({
        content: msg,
        username: getUniqueName(sender, undefined, true),
        avatarURL: sender.skinId != -1 ? `https://craftnite.2d.rocks/${SKIN_IDS[sender.skinId]}.png?v=2` : undefined,
    })
}
