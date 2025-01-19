import { Message, PermissionFlagsBits } from 'discord.js';
import db from '../../../db/db';
import { inventory } from '../../../db/schema';
import hasMention from '../../../decorators/has-mention';
import hasPermission from '../../../decorators/has-permission';
import CharacterFactory from '../../../factories/character-factory';
import ItemFactory from '../../../factories/item-factory';
import { getIdFromMention } from '../../../utils';
import Command from '../../base-command';

export default class GiveItem implements Command {
    @hasPermission(PermissionFlagsBits.ManageChannels)
    @hasMention()
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        let quantity = 1;
        let char;
        if (messageAsList[1].includes('@')) {
            char = await CharacterFactory.getFromId(getIdFromMention(messageAsList[1]), message);
        } else {
            char = await CharacterFactory.getFromId(message.author.id, message);
        }

        messageAsList.splice(0, 2);
        if (!isNaN(parseInt(messageAsList[0]))) {
            quantity = parseInt(messageAsList[0]);
            messageAsList.splice(0, 1);
        }
        const itemName = messageAsList.join(' ');

        let item;

        try {
            item = await ItemFactory.getFromName(itemName);
        } catch {
            await message.reply(`Não foi encontrado um item com o nome **${itemName}**.`);
            return;
        }

        for (let i = 0; i < quantity; i++) {
            await db
                .insert(inventory)
                .values({ itemId: item.id, characterId: char.id, durability: item.durability });
        }

        message.reply(`Você deu com sucesso **${quantity}** **${itemName}** para ${char.name}`);
    }
}
