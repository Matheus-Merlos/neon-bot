import { default as ItemFactory } from '../../../factories/item-factory';
import { InfoCommand } from '../../base-command';

export default class Item extends InfoCommand {
    constructor() {
        super(ItemFactory.getInstance(), 'item');
    }
}
