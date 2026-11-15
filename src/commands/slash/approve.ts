import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ApproveStrategy from '../../strategies/ai/approve';

const strategy = new ApproveStrategy();

export default {
    data: new SlashCommandBuilder()
        .setName('approve')
        .setDescription('Avaliar uma habilidade usando IA')
        .addStringOption((option) =>
            option
                .setName('message_id')
                .setDescription('ID da mensagem contendo a habilidade a ser avaliada')
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await strategy.executeSlashCommand(interaction);
    },
};
