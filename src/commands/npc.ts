import { CreateNPCStrategy, DefaultStrategy, SwitchNPCStrategy } from '../strategies';
import { StrategyCommand } from './base-command';

export default class NPC extends StrategyCommand {
    constructor() {
        super(
            'npc',
            {
                create: new CreateNPCStrategy(),
                switch: new SwitchNPCStrategy(),
            },
            new DefaultStrategy('npc', {}),
        );
    }
}
