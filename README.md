# Craftnite bot
A project i made some time in 2021 which implements a complete console client/bot for the abandoned browser game [craftnite.io](https://craftnite.io/).
I'm making this public long after (2025) because I think it's kind of neat, but i dont remember much of the implementation. I haven't made any changes on it since 2022, so various things are broken.

I made this for fun / out of boredom. I learned various things about three.js, packet protocols, and common voxelgame engine features like greedy meshing and chunk compression.

This wasn't initially made with git because it was one of those things that was "just a little experiment" and "no way this will get complex enough to warrant a git project".

## Features
- Client
  - All packets
    - Some packets exist but are effectively useless. It seems like there were more gamemode types and maps planned and partially implemented, but they aren't present in the current state of the game
  - WebSocket connection client with Events
  - World and Chunk state keeping system with a diff-edit system for optimized batched block updates
    - Looks like I never actually used/completed this system
- Bot
  - Interactive Terminal with command input
    - The command input doesnt seem to work when running it via tsx? It used to work with the ts-node loader to execute typescript, but that doesnt seem to work anymore either.
  - Command system via public chat
  - Ability to load minecraft `.nbt` structure files and place them into the world
    - The game textures are taken from a literal minecraft texture pack, so there is a pretty clear mapping of minecraft blocks to craftnite blocks
    - Uses many clients to be able to place large structures at reasonable speeds
    - These structure files can be created with the vanilla structure blocks or various Schematic mods
  - Sync chat messages from all server instances to discord webhooks

## Research notes
- Craftnite uses ""obfuscation"" in the form of replacing specific strings with "a" + an integer, ex. "a778" = "leg"
  - This is only applied to a very limited set of strings so it is not very effective
  - This seems to be applied with no understanding of javascript and no consideration of its functionality, basically a ctrl-f replace-all. It thus notably breaks the skin "legendary" as it is obfuscated in code to "a778endary" but the asset files are not renamed to match. This causes this skin to be invisible ingame, and the game to crash when getting killed by a player with this skin.
- Sending too many or too large packets from a single client causes the entire server instance to simply stop
  - The nbt placing feature uses many clients ("slaves") to send the place packets to avoid this
    - yes, i'd call them something else nowadays

## Demo

Have a way-too-long long video from 2022 of the minecraft schematic loading that i found in my ShareX history

https://github.com/user-attachments/assets/0f56cf77-c550-47b5-97c3-edfa59e1d2da
