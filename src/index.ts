export const clients: Client[] = [];

import "colors";
import { log, logChat, logJoinLeave } from "./terminal.js";
import { Client } from "./client.js";
import { execCommand } from "./commands.js";
import { sendToWebhook } from "./discordSender.js";

((async () => {
    // let req = await fetch("https://craftnite.io/gs/requestServer.php?game=craftnite&filter=infinite_ffa");
    // let text = await req.text();
    for (let i = 1; i <= 20; i++) {
        let server = "ffa" + i+ ".craftnite.io";
        let url = `wss://${server}/s`;
        let client = new Client(url, i);
        clients.push(client);
        client.on("chat", async (player, message) => {
            if (message.trim() == "") return;
            if (await execCommand(client, player.playerId, message)) {
                logChat(i, player, message.yellow);
            } else {
                logChat(i, player, message);
            }
            sendToWebhook(i, message, player);
        });
        client.on("playerJoin", (player) => {
            logJoinLeave(i, player, true);
        })
        client.on("playerLeave", (player) => {
            logJoinLeave(i, player, false);
        })
        client.on("connect", () => {
            sendToWebhook(i, "**Connected to server**", { playerId: 0, username: "Server", skinId: -1, score: 0 });
        })
        client.on("disconnect", () => {
            sendToWebhook(i, "**Disconnected from server**", { playerId: 0, username: "Server", skinId: -1, score: 0 });
            client.connect(url)
        })
    }
}))();