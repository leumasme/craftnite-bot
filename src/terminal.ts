import blessed from "blessed";
import "colors";

import { clients } from "./index.js";
import { Player } from "./client.js";
import { cleanString, getUniqueName } from "./utils.js";
import { sendToWebhook } from "./discordSender.js";

var screen = blessed.screen();
var body = blessed.box({
    top: 0,
    left: 0,
    height: '100%-1',
    width: '100%',
    keys: true,
    mouse: true,
    alwaysScroll: true,
    scrollable: true,
});
var inputBar = blessed.textbox({
    bottom: 0,
    left: 0,
    height: 1,
    width: '100%',
    keys: true,
    mouse: true,
    inputOnFocus: true,
    style: {
        fg: 'white',
        bg: 'grey'  // Blue background so you see this is different from body
    }
});

// Add body to blessed screen
screen.append(body);
screen.append(inputBar);

export function log(...text: (string | number)[]) {
    let scroll = body.getScrollPerc() == 100 || body.getScrollPerc() == 0;
    body.pushLine(text.join(" "));
    if (scroll) body.setScrollPerc(100);
    screen.render();
}

export function logChat(inst: number, player: Player, message: string) {
    if (selected && selected != inst) return;
    log(`[${inst.toString().padStart(2, "0").blue}] <${getUniqueName(player)}> ${message}`)
}

export function logJoinLeave(inst: number, player: Player, join: boolean) {
    if (selected && selected != inst) return;
    let p = getUniqueName(player);
    log(`[${inst.toString().padStart(2, "0").blue}] '${join ? p.green : p.red}' ${join ? "joined" : "left"}`)
}

inputBar.key(['C-c'], async (ch, key) => {
    let proms = []
    for (let c of clients) {
        proms.push(sendToWebhook(c.instance, "**Shutting Down...**", { playerId: 0, username: "Server", skinId: -1, score: 0 }));
    }
    await Promise.all(proms);
    return process.exit(0);
});

// Command handlers
let selected: number | null = null;
inputBar.on('submit', (text: string) => {
    log("> ".black.bgCyan + text.yellow);
    let args = text.split(" ")
    if (text == "top") {
        let clients2 = Array.from(clients).sort((a, b) => {
            let maxA = Math.max(...a.players.map(p => p.score));
            let maxB = Math.max(...b.players.map(p => p.score));
            return maxB - maxA;
        });
        clients2.map(c => {
            let topPlayer = c.players.sort((a, b) => b.score - a.score)[0];
            log(`${c.instance}: ${c.players.length} players, ${topPlayer.username} has the most points (${topPlayer.score})`.yellow);
        })
    }
    if (args[0] == "list") {
        if (args[1] || selected) {
            let client = clients.find(x => x.instance == parseInt(args[1] ?? selected));
            if (!client) {
                log(`!? Client ${args[1]} not found`);
                return;
            }
            client.players.map(p => {
                let name = `(${getUniqueName(p)})`;
                name = p.username == "unnamed" ? name.padEnd(33, " ") : name.padEnd(23, " ");
                log(`${name}: ${p.score}`)
            });
            log(`Total players: ${client.players.length}`.yellow);
        } else {
            // show client player count or offline in red if not ready
            clients.map(c => {
                let text = `${c.instance}: ${c.players.length} players`;
                text = c.ready ? text.yellow : text.red;
                log(text);
            });
            log(`Total players: ${clients.map(c => c.players.length).reduce((a, b) => a + b)}`.yellow);
        }
    }
    if (args[0] == "select") {
        if (args[1]) {
            selected = parseInt(args[1]);
            log(`Selected client ${selected}`.yellow);
        } else {
            selected = null;
            log(`Cleared selection`.yellow);
        }
    }
    if (args[0] == "find") {
        if (!args[1]) return;
        for (let c of clients) {
            for (let p of c.players) {
                if (cleanString(p.username).toLowerCase().includes(args[1].toLowerCase())
                    && p.playerId != c.playerId) {
                    log(`${c.instance}: ${p.username}`.yellow);
                }
            }
        }

    }
    if (args[0] == "kill") {
        if (args.length == 1) return;
        if (args.length >= 2) {
            let client = clients.find(x => x.instance == selected);
            if (!client) {
                log(`!? Client ${selected} not found`.red);
                return;
            }
            if (args[1] == "*") {
                var players = client.players;
            } else {
                let name = args.slice(1).join(" ");
                var players = client.players.filter(p =>
                    cleanString(p.username.toLowerCase()) == name.toLowerCase() || getUniqueName(p) == name.toLowerCase());
            }
            log(`Killing ${players.length.toString()} players!`.yellow);
            for (let p of players) {
                client.dealDamage(p.playerId, 200);
            }
        }
    }
    if (args[0] == "killperm") {
        if (args.length == 1) return;
        if (args.length >= 2) {
            setInterval(()=>{
                let client = clients.find(x => x.instance == selected);
                if (!client) {
                    log(`!? Client ${selected} not found`.red);
                    return;
                }
                if (args[1] == "*") {
                    var players = client.players;
                } else {
                    let name = args.slice(1).join(" ");
                    var players = client.players.filter(p =>
                        cleanString(p.username.toLowerCase()) == name.toLowerCase() || getUniqueName(p) == name.toLowerCase());
                }
                if (players.length != 0) log(`Killing ${players.length.toString()} players!`.yellow);
                for (let p of players) {
                    client.dealDamage(p.playerId, 200);
                }
            }, 1000)
        }
    }
    if (args[0] == "spam") {
        if (args.length >= 3) {
            let amt = parseInt(args[1]);
            if (isNaN(amt)) {
                log("!? Invalid amount".red);
                return;
            }

            let c = selected ? [clients.find(x => x.instance == selected)!] : clients;
            for (let i = 0; i < amt; i++) {
                for (let client of c) {
                    if (client.ready) {
                        client.sendChat(args.slice(2).join(" "));
                    }
                }
            }
            log("Spammed".yellow);
        }
    }
    inputBar.clearValue();
    screen.render();
    inputBar.focus();
});

screen.key('enter', (ch, key) => {
    inputBar.focus();
});

log("Hello, World from end of Terminal")