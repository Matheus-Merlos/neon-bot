import { Colors, PermissionFlagsBits } from 'discord.js';
import { HasStrategyPermission } from '../decorators';
import { SystemFactory } from '../factories';
import {
    CreateSystemStrategy,
    DefaultStrategy,
    DeleteStrategy,
    InfoStrategy,
    ListStrategy,
} from '../strategies';
import { StrategyCommand } from './base-command';

export default class System extends StrategyCommand {
    constructor() {
        super(
            'system',
            {
                create: new CreateSystemStrategy(),
                info: new InfoStrategy(SystemFactory),
                delete: new HasStrategyPermission(
                    new DeleteStrategy(SystemFactory, 'sistema'),
                    PermissionFlagsBits.Administrator,
                ),
                list: new ListStrategy(
                    SystemFactory,
                    'Sistemas do servidor',
                    Colors.DarkBlue,
                    async (entry) => {
                        return [
                            {
                                name: `Sistema ${entry.id} - ${entry.name}`,
                                value: `${entry.description.substring(0, 200)}`,
                                inline: false,
                            },
                        ];
                    },
                ),
            },
            new DefaultStrategy('system', {
                create: 'Comando para criar um sistema: `;system create <nome (ENTRE ASPAS)> <descricao>`',
                info: 'Informações sobre uma sistema. `;system info <nome>`',
                delete: 'Deleta um sistema. `;system delete <nome>`',
                list: 'Irá listar todos os sistemas definidos.',
            }),
        );
    }
}
