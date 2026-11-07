import { Colors, PermissionFlagsBits } from 'discord.js';
import { HasStrategyPermission } from '../decorators';
import { RuleFactory } from '../factories';
import {
    CreateRuleStrategy,
    DefaultStrategy,
    DeleteStrategy,
    InfoStrategy,
    ListStrategy,
} from '../strategies';
import { StrategyCommand } from './base-command';

export default class Rule extends StrategyCommand {
    constructor() {
        super(
            'rule',
            {
                create: new CreateRuleStrategy(),
                info: new InfoStrategy(RuleFactory),
                delete: new HasStrategyPermission(
                    new DeleteStrategy(RuleFactory, 'regra'),
                    PermissionFlagsBits.Administrator,
                ),
                list: new ListStrategy(
                    RuleFactory,
                    'Regras de Aprovação do servidor',
                    Colors.DarkRed,
                    async (entry) => {
                        return [
                            {
                                name: `Regra ${entry.id} - ${entry.name}`,
                                value: `${entry.description}`,
                                inline: false,
                            },
                        ];
                    },
                ),
            },
            new DefaultStrategy('rule', {
                create: 'Comando para criar uma regra: `;rule create <nome (ENTRE ASPAS)> <descricao>`',
                info: 'Informações sobre uma regra. `;rule info <nome>`',
                delete: 'Deleta uma regra. `;rule delete <nome>`',
                list: 'Irá listar todos as regras definidas.',
            }),
        );
    }
}
