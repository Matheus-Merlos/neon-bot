import { Message } from 'discord.js';
import db from '../../db/db';
import { inventory } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import ItemFactory from '../../factories/item-factory';
import getIdFromMention from '../../utils/get-id-from-mention';
import Strategy from '../base-strategy';

export default class GiveItemStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        let quantity = 1;
        let char;
        if (messageAsList[0].includes('@')) {
            char = await CharacterFactory.getFromPlayerId(getIdFromMention(messageAsList[0]), message.guildId!);
        } else {
            char = await CharacterFactory.getFromPlayerId(message.author.id, message.guildId!);
        }

        messageAsList.splice(0, 1);
        if (!isNaN(parseInt(messageAsList[0]))) {
            quantity = parseInt(messageAsList[0]);
            messageAsList.splice(0, 1);
        }
        const itemName = messageAsList.join(' ');

        let item;

        try {
            item = await ItemFactory.getByName(itemName, message.guildId!);
        } catch {
            await message.reply(`Não foi encontrado um item com o nome **${itemName}**.`);
            return;
        }

        for (let i = 0; i < quantity; i++) {
            await db.insert(inventory).values({ itemId: item.id, characterId: char.id, durability: item.durability });
        }

        message.reply(`Você deu com sucesso **${quantity}** **${itemName}** para ${char.name}`);
    }
}
