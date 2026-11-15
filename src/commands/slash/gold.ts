import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PayStrategy, RewardStrategy } from '../../strategies';

const addStrategy = new RewardStrategy('add', 'gold');
const removeStrategy = new RewardStrategy('remove', 'gold');
const payStrategy = new PayStrategy();

const strategies = {
    add: addStrategy,
    remove: removeStrategy,
    pay: payStrategy,
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('gold')
        .setDescription('Comando principal para Gold')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription('Adicionar Gold a um personagem')
                .addNumberOption((option) =>
                    option
                        .setName('value')
                        .setDescription('A quantidade de Gold a ser adicionada.')
                        .setRequired(true),
                )
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription('Jogador que receberá o Gold (default: você mesmo)'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('Remover Gold de um personagem')
                .addNumberOption((option) =>
                    option
                        .setName('value')
                        .setDescription('A quantidade de Gold a ser removida.')
                        .setRequired(true),
                )
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription('Jogador que perderá o Gold (default: você mesmo)'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('pay')
                .setDescription('Pagar Gold para outro personagem')
                .addNumberOption((option) =>
                    option
                        .setName('value')
                        .setDescription('A quantidade de Gold a ser paga.')
                        .setRequired(true),
                )
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription('Jogador que receberá o Gold.')
                        .setRequired(true),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();

        const strategy = strategies[subcommand as keyof typeof strategies];
        if (strategy) {
            return strategy.executeSlashCommand(interaction);
        }
    },
};
