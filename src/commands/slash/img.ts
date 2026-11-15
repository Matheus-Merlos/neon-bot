import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ImageSearchStrategy from '../../strategies/search/image';

const strategy = new ImageSearchStrategy();

export default {
    data: new SlashCommandBuilder()
        .setName('img')
        .setDescription('Pesquisar imagens no Google')
        .addStringOption((option) =>
            option.setName('query').setDescription('O que você quer pesquisar').setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await strategy.executeSlashCommand(interaction);
    },
};
