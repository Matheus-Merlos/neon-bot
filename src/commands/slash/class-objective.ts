import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { characterClass } from '../../db/schema';
import ClassObjectiveFactory from '../../factories/class-objectives/class-objective-factory';
import {
    CompletedClassObjectiveStrategy,
    CreateClassObjectiveStrategy,
    DeleteStrategy,
    ListCompletedClassObjectivesStrategy,
    ListStrategy,
} from '../../strategies';

const strategies = {
    create: new CreateClassObjectiveStrategy(),
    delete: new DeleteStrategy(ClassObjectiveFactory, 'objetivo de classe'),
    'list-all': new ListStrategy(
        ClassObjectiveFactory,
        'Objetivos de classe',
        Colors.DarkAqua,
        async (entry) => {
            const [cls] = await db
                .select()
                .from(characterClass)
                .where(eq(characterClass.id, entry.classId));
            return [
                {
                    name: `${cls.name} - ${entry.name}`,
                    value: `XP: ${entry.xp}; Dinheiro: ${entry.gold}`,
                    inline: false,
                },
                {
                    name: '',
                    value: '',
                    inline: false,
                },
            ];
        },
    ),
    'list-completed': new ListCompletedClassObjectivesStrategy(),
    completed: new CompletedClassObjectiveStrategy(),
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('class-objective')
        .setDescription('Comando para gerenciar objetivos de classe')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('create')
                .setDescription('Criar um novo objetivo de classe')
                .addStringOption((option) =>
                    option
                        .setName('class')
                        .setDescription('O nome da classe.')
                        .setRequired(true)
                        .setMaxLength(50),
                )
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
                        .setName('description')
                        .setDescription('A descrição do objetivo.')
                        .setMaxLength(2000),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Deletar um objetivo de classe.')
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
                .setName('list-all')
                .setDescription('Listar todos os objetivos de classe do servidor.'),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('list-completed')
                .setDescription('Listar objetivos de classe de um personagem')
                .addUserOption((option) =>
                    option.setName('player').setDescription('O jogador (padrão: você).'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('completed')
                .setDescription('Marcar um objetivo de classe como completo')
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
