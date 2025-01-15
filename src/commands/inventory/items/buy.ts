import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { character, inventory } from '../../../db/schema';
import CharacterFactory from '../../../factories/character-factory';
import ItemFactory from '../../../factories/item-factory';
import Command from '../../base-command';

export default class Buy implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        let quantity = 1;

        messageAsList.splice(0, 1);
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
        const char = await CharacterFactory.getFromId(message.author.id, message);

        const totalPrice = item.price * quantity;

        if (char.gold < totalPrice) {
            message.reply(`
Você não tem dinheiro o suficiente para fazer essa compra.
- Dinheiro necessário: **${totalPrice}**
- Seu dinheiro: **${char.gold}**
            `);
            return;
        }

        await db.transaction(async (trx) => {
            await trx
                .update(character)
                .set({ gold: char.gold - totalPrice })
                .where(eq(character.id, char.id));

            for (let i = 0; i < quantity; i++) {
                await trx.insert(inventory).values({ itemId: item.id, characterId: char.id });
            }
        });

        message.reply(`Você comprou com sucesso **${quantity}** **${itemName}**`);
    }
}
