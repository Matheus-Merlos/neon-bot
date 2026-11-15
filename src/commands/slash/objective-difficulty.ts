import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from 'discord.js';
import ObjectiveDifficultyFactory from '../../factories/objectives/objective-difficulty-factory';
import { CreateStrategy, DeleteStrategy, ListStrategy } from '../../strategies';

const strategies = {
    create: new CreateStrategy(ObjectiveDifficultyFactory, 'dificuldade de objetivo'),
    list: new ListStrategy(
        ObjectiveDifficultyFactory,
        'Dificuldades de Objetivo',
        Colors.DarkRed,
        (entry) => {
            return [
                {
                    name: `${entry.name}`,
                    value: ' ',
                    inline: false,
                },
                {
                    name: ' ',
                    value: ' ',
                    inline: false,
                },
            ];
        },
    ),
    delete: new DeleteStrategy(ObjectiveDifficultyFactory, 'dificuldade de objetivo'),
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('objective-difficulty')
        .setDescription('Comando para gerenciar dificuldades de objetivo')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('create')
                .setDescription('Criar uma nova dificuldade de objetivo')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da dificuldade (apenas uma palavra).')
                        .setRequired(true)
                        .setMaxLength(50),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('list').setDescription('Listar todas as dificuldades de objetivo.'),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Deletar uma dificuldade de objetivo.')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da dificuldade a ser deletada.')
                        .setRequired(true)
                        .setMaxLength(50),
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
