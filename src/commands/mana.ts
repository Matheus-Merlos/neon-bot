import {
    CreateManaAliasStrategy,
    DefaultStrategy,
    DisableCharacterManaStrategy,
    ManaRegenStrategy,
    SetBaseManaStrategy,
    UseManaStrategy,
} from '../strategies';
import { SuperStrategy } from '../strategies/base-strategy';
import { StrategyCommand } from './base-command';

export default class Mana extends StrategyCommand {
    constructor() {
        super(
            'mana',
            {
                disable: new DisableCharacterManaStrategy(),
                'set-base': new SetBaseManaStrategy(),
                use: new UseManaStrategy(),
                regen: new ManaRegenStrategy(),
                alias: new SuperStrategy(
                    'mana alias',
                    {
                        create: new CreateManaAliasStrategy(),
                    },
                    new DefaultStrategy('alias', {
                        alias: 'Cria um "apelido" para um valor de mana, útil para lidar com habilidades.\nUso: `;mana alias create <valor> <nome>`',
                    }),
                ),
            },
            new DefaultStrategy('mana', {
                disable:
                    'Desabilita o sistema de mana para o personagem selecionado.\nUso: `;mana disable <@menção(opcional)>`.',
                'set-base':
                    'Habilita o sistema de mana e define o valor de mana base (máxima) do personagem.\nUso: `;mana set-base <@menção(opcional)> <valor>`',
                use: 'Consome uma quantidade de mana. Aceita um valor numérico, uma porcentagem (ex: 20%) ou um alias definido.\nUso: `;mana use <@menção(opcional)> <valor(alias, porcentagem ou número)>`',
                regen: "Regenera mana. Aceita um valor numérico, uma porcentagem (ex: 20%) ou 'full' para restaurar ao máximo.\nUso: `;mana use <@menção(opcional)> <valor(full, porcentagem ou número)>`",
            }),
        );
    }
}
