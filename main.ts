#!/usr/bin/env -S deno run -A

import { token, database } from "./constants.ts";
import { parseCommands } from "./utils.ts";
import { Command } from "./types.d.ts";
import { Dialect, Sequelize } from 'npm:sequelize@6.37.5';
import { Client, Collection, Events, GatewayIntentBits } from 'npm:discord.js@14.17.3';
declare module 'npm:discord.js@14.17.3' {
    interface Client {
        commands: Collection<string, Command>;
        sequelize: Sequelize;
    }
}

const discordClient = new Client({ intents: GatewayIntentBits.Guilds });
discordClient.sequelize = new Sequelize(database.name, database.username, database.password, {
    host: database.host,
    dialect: database.dialect as Dialect
});

const oldDestroy = discordClient.destroy;
discordClient.destroy = async () => {
    await discordClient.sequelize.close();
    await oldDestroy.call(discordClient);
};

discordClient.commands = new Collection();
await parseCommands(command => discordClient.commands.set(command.data.name, command));

discordClient.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`Command not found: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

discordClient.once(Events.ClientReady, readyClient => console.info(`Logged in as ${readyClient.user.tag}`));

const startTime = Date.now();
await discordClient.login(token);
console.info('Login time was ' + (Date.now() - startTime) + 'ms');