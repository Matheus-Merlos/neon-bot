import { EditImageStrategy, EditStrategy } from '../strategies';
import { StrategyCommand } from './base-command';

export default class Character extends StrategyCommand {
    constructor() {
        super('character', {
            edit: new EditStrategy({
                image: new EditImageStrategy(),
            }),
        });
    }
}
