import { Colors, PermissionFlagsBits } from 'discord.js';
import { HasStrategyPermission } from '../decorators';
import ObjectiveDifficultyFactory from '../factories/objectives/objective-difficulty-factory';
import ObjectiveFactory from '../factories/objectives/objective-factory';
import {
    CompleteObjectiveStrategy,
    CreateObjectiveStrategy,
    DefaultStrategy,
    InfoStrategy,
    ListCompletedObjectivesStrategy,
    ListStrategy,
    SelectObjectiveStrategy,
    SelectedObjectivesStrategy,
} from '../strategies';
import DeleteStrategy from '../strategies/generics/delete';
import { StrategyCommand } from './base-command';

export default class Objective extends StrategyCommand {
    constructor() {
        super(
            'objective',
            {
                create: new HasStrategyPermission(new CreateObjectiveStrategy(), PermissionFlagsBits.Administrator),
                list: new ListStrategy(ObjectiveFactory, 'Objetivos do servidor', Colors.Blurple, async (entry) => {
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
                }),
                info: new InfoStrategy(ObjectiveFactory),
                delete: new HasStrategyPermission(
                    new DeleteStrategy(ObjectiveFactory, 'objetivo'),
                    PermissionFlagsBits.Administrator,
                ),
                select: new SelectObjectiveStrategy(),
                selected: new SelectedObjectivesStrategy(),
                completed: new HasStrategyPermission(new CompleteObjectiveStrategy(), PermissionFlagsBits.ManageGuild),
                'list-completed': new ListCompletedObjectivesStrategy(),
            },
            new DefaultStrategy('objective', {
                create: 'Cria um novo objetivo no servidor. Use a sintaxe: `<nome_objetivo> <xp> <ouro> <dificuldade> <descrição>`.',
                list: 'Exibe todos os objetivos disponíveis no servidor.',
                info: 'Mostra os detalhes do objetivo mencionado.',
                delete: 'Remove o objetivo mencionado do servidor e de todos os personagens, mas mantém o XP obtido.',
                select: 'Atribui um objetivo a um personagem (ou a si mesmo). Sintaxe: `<@menção (opcional)> <nome_objetivo>`.',
                selected: 'Lista os objetivos atualmente atribuídos a um personagem ou a si mesmo (menção opcional).',
                completed: 'Marca um objetivo como concluído, concede as recompensas e remove-o da lista de objetivos ativos.',
                'list-completed': 'Exibe todos os objetivos concluídos de um personagem ou de si mesmo.',
            }),
        );
    }
}
