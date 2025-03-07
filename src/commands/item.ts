import { Colors } from 'discord.js';
import ItemFactory from '../factories/item-factory';
import {
    BuyStrategy,
    CreateItemStrategy,
    DeleteStrategy,
    GiveItemStrategy,
    InfoStrategy,
    ListStrategy,
    UseStrategy,
} from '../strategies';
import { StrategyCommand } from './base-command';

export default class Item extends StrategyCommand {
    constructor() {
        const listStrategy = new ListStrategy(ItemFactory.getInstance(), 'Loja', Colors.Gold, (entry) => {
            return [
                {
                    name: `$${entry.price} - ${entry.name}`,
                    value: `Durabilidade: ${entry.durability} usos.`,
                    inline: false,
                },
                {
                    name: ' ',
                    value: ' ',
                    inline: false,
                },
            ];
        });
        super('item', {
            create: new CreateItemStrategy(),
            info: new InfoStrategy(ItemFactory.getInstance()),
            list: listStrategy,
            shop: listStrategy,
            delete: new DeleteStrategy(ItemFactory.getInstance(), 'item'),
            buy: new BuyStrategy(),
            give: new GiveItemStrategy(),
            use: new UseStrategy(),
        });
    }
}
