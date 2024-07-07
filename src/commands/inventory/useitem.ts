import { and, eq, ilike } from 'drizzle-orm';
import db from '../../models/db';
import { inventario, item, personagem } from '../../models/schema';
import Command from '../command';

type InventoryItem = {
    inventoryEntryId: number;
    durability: number;
};

class ItemNotFoundError extends Error {}
class ItemNotInInventoryError extends Error {}

export default class UseItem extends Command {
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');
        const commandArgs: Array<string> = msgArray.slice(1);

        let quantityToUse: number;

        const isFirstArgumentNumeric: boolean = !isNaN(parseInt(commandArgs[0]));
        const isLastArgumentNumeric: boolean = !isNaN(
            parseInt(commandArgs[commandArgs.length - 1]),
        );

        const providedQuantity = !isLastArgumentNumeric && !isFirstArgumentNumeric;

        if (!providedQuantity) {
            quantityToUse = 1;
        }

        if (isFirstArgumentNumeric) {
            quantityToUse = parseInt(commandArgs.shift()!);
        } else {
            quantityToUse = parseInt(commandArgs.pop()!);
        }

        let itemName = commandArgs.join(' ');
        let itemId: number;

        if (itemName === '') {
            itemName = msgArray[1];
        }

        try {
            itemId = await this.getItemIdFromName(itemName);
        } catch (error: unknown) {
            if (error instanceof ItemNotFoundError) {
                this.message.reply(`Não existe um item com o nome **${itemName}**`);
                return;
            }
            this.message.reply(`Houve um erro ao procurar o item na base de dados: **${error}**`);
            return;
        }

        let itemInventoryList: Array<InventoryItem>;

        const id: string = this.message.author.id;
        try {
            itemInventoryList = await this.getItemFromInventory(id, itemId);
        } catch (error: unknown) {
            if (error instanceof ItemNotInInventoryError) {
                this.message.reply(`Você não possui ${itemName} em seu inventário`);
                return;
            }
            this.message.reply(`Houve um erro ao procurar item no inventário: **${error}**}`);
            return;
        }

        let totalAvailableDurability: number = 0;
        itemInventoryList!.forEach(
            (item: InventoryItem) => (totalAvailableDurability += item.durability),
        );

        if (quantityToUse > totalAvailableDurability) {
            this.message.reply(
                `Você não possui durabilidade suficiente para utilizar esse item ${quantityToUse} vezes`,
            );
            return;
        }

        const inventoryEntriesToDelete: Array<number> = [];
        for (const item of itemInventoryList) {
            if (item.durability <= quantityToUse) {
                inventoryEntriesToDelete.push(item.inventoryEntryId);
                quantityToUse -= item.durability;
                continue;
            }
            item.durability -= quantityToUse;

            await this.updateInventoryEntry(item);
            break;
        }

        if (inventoryEntriesToDelete) await this.deleteInventoryEntries(inventoryEntriesToDelete);

        await this.message.reply(':thumbsup:');
    }

    private async getItemIdFromName(itemName: string): Promise<number> {
        const items: Array<{ itemId: number }> = await db
            .select({ itemId: item.id })
            .from(item)
            .where(ilike(item.nome, `%${itemName}%`));

        if (items.length === 0) {
            throw new ItemNotFoundError(`Item with name ${itemName} does not exist`);
        }

        return items[0].itemId;
    }
    private async getItemFromInventory(
        playerId: string,
        itemId: number,
    ): Promise<Array<InventoryItem>> {
        const inventoryItems: Array<InventoryItem> = await db
            .select({
                inventoryEntryId: inventario.id,
                durability: inventario.durabilidadeAtual,
            })
            .from(inventario)
            .innerJoin(personagem, eq(inventario.idPersonagem, personagem.id))
            .where(
                and(
                    eq(personagem.jogador, BigInt(playerId)),
                    eq(personagem.ativo, true),
                    eq(inventario.idItem, itemId),
                ),
            )
            .orderBy(inventario.id);

        if (inventoryItems.length === 0) {
            throw new ItemNotInInventoryError('Item not found in inventory');
        }
        return inventoryItems;
    }
    private async deleteInventoryEntries(entryList: Array<number>) {
        entryList.forEach(async (entry) => {
            const name = await this.getItemNameFromInventoryEntry(entry);

            await this.message.reply(
                `O seu item **${name.itemName}** quebrou e foi removido do seu inventário`,
            );
        });

        entryList.forEach(async (entry: number) => {
            await db.delete(inventario).where(eq(inventario.id, entry));
        });
    }
    private async getItemNameFromInventoryEntry(entryId: number): Promise<{ itemName: string }> {
        const names = await db
            .select({ itemName: item.nome })
            .from(inventario)
            .innerJoin(item, eq(inventario.idItem, item.id))
            .where(eq(inventario.id, entryId));

        return names[0];
    }
    private async updateInventoryEntry(entry: InventoryItem) {
        await db
            .update(inventario)
            .set({ durabilidadeAtual: entry.durability })
            .where(eq(inventario.id, entry.inventoryEntryId));
    }
}
