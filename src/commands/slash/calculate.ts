import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('calculate')
        .setDescription('Calcular uma expressão matemática')
        .addStringOption((option) =>
            option
                .setName('formula')
                .setDescription('A fórmula a ser calculada (ex: 2+2, 10*5)')
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const formula = interaction.options.getString('formula', true);

        let result;
        try {
            result = eval(formula);
        } catch {
            await interaction.reply(`Erro: A fórmula \`${formula}\` não é uma fórmula válida.`);
            return;
        }

        await interaction.reply(`O resultado de \`${formula}\` é **${result}**`);
    },
};
