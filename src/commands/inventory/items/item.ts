import { Message } from 'discord.js';
import ItemFactory from '../../../factories/item-factory';
import Command from '../../base-command';

export default class Item implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const itemName = messageAsList.slice(1, messageAsList.length).join(' ').trim();

        const item = await ItemFactory.getFromName(itemName);

        await ItemFactory.sendItem(message, item);
    }
}
