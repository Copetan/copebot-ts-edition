// noinspection JSUnusedGlobalSymbols

import { SlashCommandBuilder, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } from "npm:discord.js@14.17.3";
import { jurisdictionMap } from "../road-closures.ts";
import { modulo } from "../utils.ts";

export const data = new SlashCommandBuilder()
    .setName('road-closures')
    .setDescription('Get the latest road closures for the selected jurisdiction')
    .addSubcommand(subcommand => subcommand
        .setName('print')
        .setDescription('Sends the road closures in the current channel as messages (if possible)')
        .addStringOption(option => option
            .setName('jurisdiction')
            .setDescription('The jurisdiction (city, county, or state) to get road closure information for')
            .setRequired(true)
            .addChoices(
                { name: 'Los Angeles County', value: 'county_la' },
            )
        )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    if (interaction.options.getSubcommand() === 'print') {
        const embedsPromise = jurisdictionMap[interaction.options.getString('jurisdiction') ?? 'invalid']();
        const response = await interaction.deferReply({ withResponse: true });

        let currentIndex: number = 0;
        const embeds = await embedsPromise;
        await interaction.editReply({ embeds: [(embeds)[currentIndex].get] });

        if (embeds.length === 1) return;

        const left = new ButtonBuilder()
            .setCustomId('rc_left')
            .setLabel('◀')
            .setStyle(ButtonStyle.Primary);
        const right = new ButtonBuilder()
            .setCustomId('rc_right')
            .setLabel('▶')
            .setStyle(ButtonStyle.Primary);
        const garbage = new ButtonBuilder()
            .setCustomId('rc_garbage')
            .setLabel('🗑️')
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(left, right, garbage);

        await interaction.editReply({ components: [row] });

        const collector =  response.resource!.message!.createMessageComponentCollector(
            { componentType: ComponentType.Button, filter: messageInteraction => messageInteraction.user.id === interaction.user.id, idle: 60_000 }
        );

        collector.on('collect', async buttonInteraction => {
            buttonInteraction.deferUpdate();
            if (buttonInteraction.customId === 'rc_left') {
                currentIndex = modulo(currentIndex - 1, embeds.length);
                await interaction.editReply({ embeds: [(embeds)[currentIndex].get] });
            } else if (buttonInteraction.customId === 'rc_right') {
                currentIndex = modulo(currentIndex + 1, embeds.length);
                await interaction.editReply({ embeds: [(embeds)[currentIndex].get] });
            } else if (buttonInteraction.customId === 'rc_garbage') {
                await interaction.editReply({ components: [] });
                collector.stop();
            }
        });

        collector.on('end', async () => {
            await interaction.editReply({ components: [] });
        });
    }
}