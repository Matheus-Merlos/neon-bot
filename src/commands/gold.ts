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
            new DefaultStrategy('gold', {}),
        );
    }
}
