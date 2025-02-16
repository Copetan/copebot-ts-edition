// noinspection JSUnusedGlobalSymbols

import { SlashCommandBuilder, ChatInputCommandInteraction } from "npm:discord.js@14.17.3";

export const data = new SlashCommandBuilder()
    .setName('manage')
    .setDescription('Manage the bot (bot owner only)')
    .addSubcommand(subcommand => subcommand.setName('shutdown')
        .setDescription('Shut down the bot (Bot owner only)'));

export async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.options.getSubcommand() === 'shutdown') {
        if (interaction.user.id === '360613897994108939') {
            await interaction.reply('Shutting down now. Goodbye!');
            await interaction.client.destroy();
        } else {
            await interaction.reply('nuh-uh-uh <a:fingerWag:1336155357914861668>');
        }
    }
}