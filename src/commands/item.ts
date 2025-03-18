import { Colors, PermissionFlagsBits } from 'discord.js';
import { item } from '../db/schema';
import { HasStrategyPermission } from '../decorators';
import ItemFactory from '../factories/item-factory';
import {
    BuyStrategy,
    CreateItemStrategy,
    DeleteStrategy,
    EditImageStrategy,
    EditStrategy,
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
            create: new HasStrategyPermission(new CreateItemStrategy(), PermissionFlagsBits.ManageChannels),
            info: new InfoStrategy(ItemFactory.getInstance()),
            list: listStrategy,
            shop: listStrategy,
            delete: new HasStrategyPermission(
                new DeleteStrategy(ItemFactory.getInstance(), 'item'),
                PermissionFlagsBits.ManageChannels,
            ),
            buy: new BuyStrategy(),
            give: new HasStrategyPermission(new GiveItemStrategy(), PermissionFlagsBits.ManageGuild),
            use: new UseStrategy(),
            edit: new EditStrategy({
                image: new HasStrategyPermission(
                    new EditImageStrategy(ItemFactory.getInstance(), item),
                    PermissionFlagsBits.ManageChannels,
                ),
            }),
        });
    }
}
