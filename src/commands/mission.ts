import { Colors, PermissionFlagsBits } from 'discord.js';
import { mission } from '../db/schema';
import { HasStrategyPermission } from '../decorators';
import MissionDifficultyFactory from '../factories/missions/mission-difficulty-factory';
import MissionFactory from '../factories/missions/mission-factory';
import {
    CompletedMissionStrategy,
    CreateMissionStrategy,
    DefaultStrategy,
    DeleteStrategy,
    EditImageStrategy,
    EditStrategy,
    InfoStrategy,
    ListStrategy,
} from '../strategies';
import { StrategyCommand } from './base-command';

export default class Mission extends StrategyCommand {
    constructor() {
        super(
            'mission',
            {
                create: new HasStrategyPermission(new CreateMissionStrategy(), PermissionFlagsBits.ManageChannels),
                info: new InfoStrategy(MissionFactory),
                list: new ListStrategy(MissionFactory, 'missões', Colors.Fuchsia, async (entry) => {
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
                delete: new HasStrategyPermission(
                    new DeleteStrategy(MissionFactory, 'missão'),
                    PermissionFlagsBits.ManageChannels,
                ),
                complete: new HasStrategyPermission(new CompletedMissionStrategy(), PermissionFlagsBits.ManageChannels),
                edit: new EditStrategy({
                    image: new HasStrategyPermission(
                        new EditImageStrategy(MissionFactory, mission),
                        PermissionFlagsBits.ManageChannels,
                    ),
                }),
            },
            new DefaultStrategy('mission', {
                create: 'Cria uma missão para o servidor.\n`;mission create <dificuldade> <nome> <xp> <gold> <descrição> <anexo_imagem(opcional)>`.',
                info: 'Mostra detalhes de uma missão\n`;mission info <nome_missao>`',
                delete: 'Deleta uma missão.\n`;item delete <nome_missao>`.',
                list: 'Lista todas as missões do servidor.',
                complete:
                    'Marca a missão como concluída, e dá o respectivo XP a todos os personagens mencionados\n`;mission complete <nome_missao> <@menções(várias)>`',
                edit: 'Edita alguma característica de um item\n`;mission edit <image> <nome_item> <anexar imagem nova>`',
            }),
        );
    }
}
