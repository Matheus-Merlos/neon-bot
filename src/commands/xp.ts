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
            new DefaultStrategy('exp', {}),
        );
    }
}
