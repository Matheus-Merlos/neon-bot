import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import QuestionStrategy from '../../strategies/ai/question';

const strategy = new QuestionStrategy();

export default {
    data: new SlashCommandBuilder()
        .setName('question')
        .setDescription('Fazer uma pergunta sobre as regras do sistema')
        .addStringOption((option) =>
            option
                .setName('question')
                .setDescription('Sua dúvida sobre as regras')
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await strategy.executeSlashCommand(interaction);
    },
};
