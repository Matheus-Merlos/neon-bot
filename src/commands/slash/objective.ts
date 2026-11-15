import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from 'discord.js';
import ObjectiveDifficultyFactory from '../../factories/objectives/objective-difficulty-factory';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import {
    CompleteObjectiveStrategy,
    CreateObjectiveStrategy,
    DeleteStrategy,
    InfoStrategy,
    ListCompletedObjectivesStrategy,
    ListStrategy,
    RemoveSelectedObjectiveStrategy,
    SelectObjectiveStrategy,
    SelectedObjectivesStrategy,
} from '../../strategies';

const strategies = {
    create: new CreateObjectiveStrategy(),
    list: new ListStrategy(
        ObjectiveFactory,
        'Objetivos do servidor',
        Colors.Blurple,
        async (entry) => {
            const objectiveDifficulty = await ObjectiveDifficultyFactory.getFromId(entry.type);

            return [
                {
                    name: `${entry.name} - ${objectiveDifficulty.name}`,
                    value: `XP: ${entry.xp} | Dinheiro: $${entry.gold}`,
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
    info: new InfoStrategy(ObjectiveFactory),
    delete: new DeleteStrategy(ObjectiveFactory, 'objetivo'),
    select: new SelectObjectiveStrategy(),
    selected: new SelectedObjectivesStrategy(),
    completed: new CompleteObjectiveStrategy(),
    'list-completed': new ListCompletedObjectivesStrategy(),
    unselect: new RemoveSelectedObjectiveStrategy(),
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('objective')
        .setDescription('Comando para gerenciar objetivos')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('create')
                .setDescription('Criar um novo objetivo')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do objetivo.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addNumberOption((option) =>
                    option
                        .setName('xp')
                        .setDescription('A quantidade de XP do objetivo.')
                        .setRequired(true),
                )
                .addNumberOption((option) =>
                    option
                        .setName('gold')
                        .setDescription('A quantidade de gold do objetivo.')
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName('difficulty')
                        .setDescription('A dificuldade do objetivo.')
                        .setRequired(true)
                        .setMaxLength(50),
                )
                .addStringOption((option) =>
                    option
                        .setName('description')
                        .setDescription('A descrição do objetivo.')
                        .setMaxLength(2000),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('list').setDescription('Listar todos os objetivos.'),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('info')
                .setDescription('Informações sobre um objetivo específico')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do objetivo.')
                        .setRequired(true)
                        .setMaxLength(127),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Deletar um objetivo.')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do objetivo a ser deletado.')
                        .setRequired(true)
                        .setMaxLength(127),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('select')
                .setDescription('Selecionar um objetivo para um personagem')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do objetivo.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription('O jogador para quem selecionar (padrão: você).'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('selected')
                .setDescription('Ver objetivos selecionados de um personagem')
                .addUserOption((option) =>
                    option.setName('player').setDescription('O jogador (padrão: você).'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('completed')
                .setDescription('Marcar um objetivo como completo')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do objetivo.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addUserOption((option) =>
                    option.setName('player').setDescription('O jogador (padrão: você).'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('list-completed')
                .setDescription('Listar objetivos completados de um personagem')
                .addUserOption((option) =>
                    option.setName('player').setDescription('O jogador (padrão: você).'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('unselect')
                .setDescription('Remover um objetivo selecionado')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do objetivo.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addUserOption((option) =>
                    option.setName('player').setDescription('O jogador (padrão: você).'),
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
