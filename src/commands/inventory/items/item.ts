import { Message } from 'discord.js';
import ItemFactory from '../../../factories/item-factory';
import Command from '../../base-command';

export default class Item implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const itemName = messageAsList.slice(1, messageAsList.length).join(' ').trim();

        let item;

        try {
            item = await ItemFactory.getFromName(itemName);
        } catch {
            await message.reply(`Não foi encontrado um item com o nome **${itemName}**.`);
            return;
        }

        await ItemFactory.sendItem(message, item);
    }
}
