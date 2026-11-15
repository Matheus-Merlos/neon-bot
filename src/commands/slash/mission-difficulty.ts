import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from 'discord.js';
import MissionDifficultyFactory from '../../factories/missions/mission-difficulty-factory';
import { CreateStrategy, DeleteStrategy, ListStrategy } from '../../strategies';

const strategies = {
    create: new CreateStrategy(MissionDifficultyFactory, 'dificuldade de missão'),
    list: new ListStrategy(
        MissionDifficultyFactory,
        'Dificuldades de Missão',
        Colors.White,
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
    delete: new DeleteStrategy(MissionDifficultyFactory, 'dificuldade de missão'),
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('mission-difficulty')
        .setDescription('Comando para gerenciar dificuldades de missão')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('create')
                .setDescription('Criar uma nova dificuldade de missão')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da dificuldade (apenas uma palavra).')
                        .setRequired(true)
                        .setMaxLength(50),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('list').setDescription('Listar todas as dificuldades de missão.'),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Deletar uma dificuldade de missão.')
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
