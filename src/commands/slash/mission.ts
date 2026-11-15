import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from 'discord.js';
import { mission } from '../../db/schema';
import MissionDifficultyFactory from '../../factories/missions/mission-difficulty-factory';
import MissionFactory from '../../factories/missions/mission-factory';
import {
    CompletedMissionStrategy,
    CreateMissionStrategy,
    DeleteStrategy,
    EditImageStrategy,
    EditStrategy,
    InfoStrategy,
    ListStrategy,
} from '../../strategies';

const strategies = {
    create: new CreateMissionStrategy(),
    list: new ListStrategy(MissionFactory, 'Missões', Colors.Fuchsia, async (entry) => {
        const missionDifficulty = await MissionDifficultyFactory.getFromId(entry.difficulty);

        return [
            {
                name: `${entry.name.toUpperCase()} - ${missionDifficulty.name}`,
                value: `XP: ${entry.xp} | Dinheiro: $${entry.gold}`,
                inline: false,
            },
            {
                name: ' ',
                value: ' ',
                inline: false,
            },
        ];
    }),
    info: new InfoStrategy(MissionFactory),
    delete: new DeleteStrategy(MissionFactory, 'Missão'),
    complete: new CompletedMissionStrategy(),
    edit: new EditStrategy({
        image: new EditImageStrategy(MissionFactory, mission),
    }),
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('mission')
        .setDescription('Comando para gerenciar missões')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('create')
                .setDescription('Criar uma nova missão')
                .addStringOption((option) =>
                    option
                        .setName('difficulty')
                        .setDescription('A dificuldade da missão.')
                        .setRequired(true)
                        .setMaxLength(50),
                )
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da missão.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addNumberOption((option) =>
                    option
                        .setName('xp')
                        .setDescription('A quantidade de XP da missão.')
                        .setRequired(true),
                )
                .addNumberOption((option) =>
                    option
                        .setName('gold')
                        .setDescription('A quantidade de gold da missão.')
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName('description')
                        .setDescription('A descrição da missão.')
                        .setMaxLength(2000),
                )
                .addAttachmentOption((option) =>
                    option.setName('image').setDescription('A imagem da missão.'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('list').setDescription('Listar todas as missões.'),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('info')
                .setDescription('Informações sobre uma missão específica')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da missão.')
                        .setRequired(true)
                        .setMaxLength(127),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Deletar uma missão.')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da missão a ser deletada.')
                        .setRequired(true)
                        .setMaxLength(127),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('complete')
                .setDescription('Marcar uma missão como completa e recompensar os jogadores')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da missão.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addUserOption((option) =>
                    option
                        .setName('player1')
                        .setDescription('Jogador que completou a missão.')
                        .setRequired(true),
                )
                .addUserOption((option) =>
                    option.setName('player2').setDescription('Jogador que completou a missão.'),
                )
                .addUserOption((option) =>
                    option.setName('player3').setDescription('Jogador que completou a missão.'),
                )
                .addUserOption((option) =>
                    option.setName('player4').setDescription('Jogador que completou a missão.'),
                )
                .addUserOption((option) =>
                    option.setName('player5').setDescription('Jogador que completou a missão.'),
                )
                .addUserOption((option) =>
                    option.setName('player6').setDescription('Jogador que completou a missão.'),
                )
                .addUserOption((option) =>
                    option.setName('player7').setDescription('Jogador que completou a missão.'),
                )
                .addUserOption((option) =>
                    option.setName('player8').setDescription('Jogador que completou a missão.'),
                )
                .addUserOption((option) =>
                    option.setName('player9').setDescription('Jogador que completou a missão.'),
                )
                .addUserOption((option) =>
                    option.setName('player10').setDescription('Jogador que completou a missão.'),
                ),
        )
        .addSubcommandGroup((group) =>
            group
                .setName('edit')
                .setDescription('Editar propriedades de uma missão')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('image')
                        .setDescription('Editar a imagem de uma missão')
                        .addStringOption((option) =>
                            option
                                .setName('item')
                                .setDescription('O nome da missão a ser editada.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addAttachmentOption((option) =>
                            option
                                .setName('image')
                                .setDescription('A nova imagem da missão.')
                                .setRequired(true),
                        ),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = group ?? interaction.options.getSubcommand();

        const strategy = strategies[subcommand as keyof typeof strategies];
        if (strategy) {
            return strategy.executeSlashCommand(interaction);
        }
    },
};
