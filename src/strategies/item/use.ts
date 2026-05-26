import { Message } from 'discord.js';
import { and, asc, eq } from 'drizzle-orm';
import db from '../../db/db';
import { inventory, item as itemTable } from '../../db/schema';
import ItemFactory from '../../factories/item-factory';
import Strategy from '../base-strategy';
import { CharacterFactory } from '../../factories';

export default class UseStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const character = await CharacterFactory.getFromPlayerId(
            message.author.id,
            message.guildId,
        );
        const hasQuantity = !isNaN(parseInt(messageAsList[0]));

        let quantity = 1;

        if (hasQuantity) {
            quantity = parseInt(messageAsList[0]);
            messageAsList.splice(0, 1);
        }

        const itemName = messageAsList.join(' ');
        let item;
        try {
            item = await ItemFactory.getByName(itemName, message.guildId);
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
            .where(and(eq(inventory.itemId, item.id), eq(inventory.characterId, character.id)))
            .innerJoin(itemTable, eq(inventory.itemId, itemTable.id))
            .orderBy(asc(inventory.durability));

        if (inventoryItems.length === 0) {
            await message.reply(`Você não possui **${item.name}** em seu inventário.`);
            return;
        }

        let totalDurability = 0;
        inventoryItems
            .map((invItem) => invItem.durability)
            .forEach((invItem) => {
                totalDurability += invItem;
            });

        if (quantity > totalDurability) {
            await message.reply(
                `Você não possui **${item.name}** o suficiente para utilizar **${quantity}** vezes.`,
            );
            return;
        }

        for (const invItem of inventoryItems) {
            if (quantity >= invItem.durability) {
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
                break;
            }
        }
        message.reply(`Você usou **${item.name}** com sucesso.`);
    }
}
