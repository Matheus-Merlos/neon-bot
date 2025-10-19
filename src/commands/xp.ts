import { DefaultStrategy, RewardStrategy } from '../strategies';
import { StrategyCommand } from './base-command';

export default class Exp extends StrategyCommand {
    constructor() {
        super(
            'exp',
            {
                add: new RewardStrategy('add', 'xp'),
                remove: new RewardStrategy('remove', 'xp'),
            },
            new DefaultStrategy('exp', {
                add: 'Adiciona exp a players. Sintaxe: `exp add <quantidade> <@Menções(pode ser várias)>`',
                remove: 'Remove exp de players. Sintaxe: `exp remove <quantidade> <@Menções(pode ser várias)>`',
            }),
        );
    }
}
