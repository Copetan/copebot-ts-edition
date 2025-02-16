#!/usr/bin/env -S deno run -A

import * as constants from "./constants.ts";
import { Command } from "./types.d.ts";
import { parseCommands } from "./utils.ts";
import { REST, Routes } from 'npm:discord.js@14.17.3';

const commands: Command[] = [];

await parseCommands(command => commands.push(command));

const commandJsons = commands.map(command => command.data.toJSON());

const rest = new REST().setToken(constants.token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        for (const serverId of constants.devServerIds) {
            await rest.put(
                Routes.applicationGuildCommands(constants.clientId, serverId),
                { body: commandJsons },
            );
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();