import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { RewardStrategy } from '../../strategies';

const addStrategy = new RewardStrategy('add', 'xp');
const removeStrategy = new RewardStrategy('remove', 'xp');

const strategies = {
    add: addStrategy,
    remove: removeStrategy,
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Comando principal para XP')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription('Adicionar XP a um personagem')
                .addNumberOption((option) =>
                    option
                        .setName('value')
                        .setDescription('A quantidade de XP a ser adicionada.')
                        .setRequired(true),
                )
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription('Jogador que receberá o XP (default: você mesmo)'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('Remover XP de um personagem')
                .addNumberOption((option) =>
                    option
                        .setName('value')
                        .setDescription('A quantidade de XP a ser removida.')
                        .setRequired(true),
                )
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription('Jogador que perderá o XP (default: você mesmo)'),
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
