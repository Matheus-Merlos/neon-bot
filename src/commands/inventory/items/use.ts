import { Message } from 'discord.js';
import { asc, eq } from 'drizzle-orm';
import db from '../../../db/db';
import { inventory, item as itemTable } from '../../../db/schema';
import ItemFactory from '../../../factories/item-factory';
import Command from '../../base-command';

export default class Use implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const hasQuantity = !isNaN(parseInt(messageAsList[1]));

        let quantity = 1;

        if (hasQuantity) {
            quantity = parseInt(messageAsList[1]);
            messageAsList.splice(0, 1);
        }
        messageAsList.splice(0, 1);

        const itemName = messageAsList.join(' ');
        let item;
        try {
            item = await ItemFactory.getFromName(itemName);
        } catch {
            await message.reply(`Não foi encontrado um item com o nome **${itemName}**.`);
            return;
        }

        const inventoryItems = await db
            .select({
                inventoryEntryId: inventory.id,
                itemId: inventory.itemId,
                name: itemTable.name,
                durability: inventory.durability,
            })
            .from(inventory)
            .where(eq(inventory.itemId, item.id))
            .innerJoin(itemTable, eq(inventory.itemId, itemTable.id))
            .orderBy(asc(itemTable.durability));

        if (inventoryItems.length === 0) {
            await message.reply(`Você não possui **${item.name}** em seu inventário.`);
            return;
        }

        const totalDurability = inventoryItems
            .map((invItem) => invItem.durability)
            .reduce((acc, val) => acc + val, 0);

        if (totalDurability < quantity) {
            await message.reply(
                `Você não possui **${item.name}** o suficiente para utilizar **${quantity}** vezes.`,
            );
        }

        for (const invItem of inventoryItems) {
            if (invItem.durability <= quantity) {
                quantity -= invItem.durability;

                await db.delete(inventory).where(eq(inventory.id, invItem.inventoryEntryId));
                continue;
            }
            if (quantity > 0) {
                const remainingDurability = invItem.durability - quantity;
                await db
                    .update(inventory)
                    .set({ durability: remainingDurability })
                    .where(eq(inventory.id, invItem.inventoryEntryId));
            }
        }
        message.reply(`Você usou **${item.name}** com sucesso.`);
    }
}
