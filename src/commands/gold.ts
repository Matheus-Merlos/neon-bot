import { DefaultStrategy, PayStrategy, RewardStrategy } from '../strategies';
import { StrategyCommand } from './base-command';

export default class Gold extends StrategyCommand {
    constructor() {
        super(
            'gold',
            {
                add: new RewardStrategy('add', 'gold'),
                remove: new RewardStrategy('remove', 'gold'),
                pay: new PayStrategy(),
            },
            new DefaultStrategy('gold', {
                add: 'Adiciona gold a players. Sintaxe: `gold add <quantidade> <@Menções(pode ser várias)>`',
                remove: 'Remove gold de players. Sintaxe: `gold remove <quantidade> <@Menções(pode ser várias)>`',
                pay: 'Dá dinheiro seu a alguma pessoa. Sintaxe: `gold pay <recebedor> <quantidade>`',
            }),
        );
    }
}
