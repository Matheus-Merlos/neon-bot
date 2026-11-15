import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import InventoryStrategy from '../../strategies/inventory/inventory';
import NewGenStrategy from '../../strategies/character/newgen';
import ResetCharacterStrategy from '../../strategies/character/reset';

const inventoryStrategy = new InventoryStrategy();
const newgenStrategy = new NewGenStrategy();
const resetStrategy = new ResetCharacterStrategy();

const strategies = {
    show: inventoryStrategy,
    newgen: newgenStrategy,
    reset: resetStrategy,
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Comandos de inventário e personagem')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('show')
                .setDescription('Mostrar o inventário de um jogador')
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription(
                            'Jogador cujo inventário será mostrado (default: você mesmo)',
                        ),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('reset')
                .setDescription('Resetar o personagem de um jogador')
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription(
                            'Jogador cujo personagem será resetado (default: você mesmo)',
                        ),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('newgen')
                .setDescription('Resetar TODOS os personagens (nova geração)'),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();

        const strategy = strategies[subcommand as keyof typeof strategies];
        if (strategy) {
            return strategy.executeSlashCommand(interaction);
        }
    },
};
