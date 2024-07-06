import { and, eq, ilike } from 'drizzle-orm';
import db from '../../models/db';
import { inventario, item, personagem } from '../../models/schema';
import Command from '../command';

type InventoryItem = {
    inventoryEntryId: number;
    itemName: string;
    durability: number;
};

class ItemNotFoundError extends Error {}
class ItemNotInInventoryError extends Error {}

export default class UseItem extends Command {
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');

        const commandArgs: Array<string> = msgArray.slice(1);

        let quantityToUse: number;
        let itemId: number;

        isNaN(parseInt(commandArgs[0]))
            ? (quantityToUse = this.getQuantityFromLastIndex(commandArgs))
            : (quantityToUse = this.getQuantityFromFirstIndex(commandArgs));

        if (isNaN(quantityToUse)) {
            quantityToUse = 1;
        }

        let itemName = commandArgs.join(' ');

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

        try {
            itemInventoryList = await this.getItemFromInventory(this.message.author.id, itemId);
        } catch (error: unknown) {
            if (error instanceof ItemNotInInventoryError) {
                this.message.reply(`Você não possui ${itemName} em seu inventário`);
            }
            this.message.reply(`Houve um erro ao procurar item no inventário: **${error}**}`);
            return;
        }

        let totalAvailableDurability: number = 0;
        itemInventoryList!.forEach(
            (item: InventoryItem) => (totalAvailableDurability += item.durability),
        );

        if (totalAvailableDurability < quantityToUse) {
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
            item.durability = item.durability - quantityToUse;
            itemInventoryList[itemInventoryList.indexOf(item)] = item;
            break;
        }
        inventoryEntriesToDelete.map((inventoryEntry) => {
            itemInventoryList.splice(
                itemInventoryList.indexOf(
                    itemInventoryList.filter((item: InventoryItem) => {
                        item.inventoryEntryId === inventoryEntry;
                    })[0],
                ),
                1,
            );
        });

        if (inventoryEntriesToDelete) {
            await this.deleteInventoryEntries(inventoryEntriesToDelete);
        }

        if (itemInventoryList) {
            await this.updateInventoryEntries(itemInventoryList);
        }

        await this.message.reply(':thumbsup:');
    }
    private getQuantityFromLastIndex(cmdArray: Array<string>): number {
        const quantity: number = parseInt(cmdArray[cmdArray.length - 1]);
        cmdArray.splice(cmdArray.length - 1, 1);

        return quantity;
    }
    private getQuantityFromFirstIndex(cmdArray: Array<string>): number {
        const quantity: number = parseInt(cmdArray[0]);
        cmdArray.splice(0, 1);

        return quantity;
    }

    private async getItemIdFromName(itemName: string): Promise<number> {
        const items: Array<{ itemId: number }> = await db
            .select({
                itemId: item.id,
            })
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
                itemName: item.nome,
                durability: inventario.durabilidadeAtual,
            })
            .from(inventario)
            .innerJoin(personagem, eq(personagem.jogador, BigInt(playerId)))
            .innerJoin(item, eq(inventario.idItem, item.id))
            .where(
                and(
                    eq(personagem.jogador, BigInt(playerId)),
                    eq(personagem.ativo, true),
                    eq(inventario.idItem, itemId),
                ),
            )
            .orderBy(inventario.id);

        if (!inventoryItems) {
            throw new ItemNotInInventoryError('Item not found in inventory');
        }
        return inventoryItems;
    }
    private async deleteInventoryEntries(entryList: Array<number>) {
        entryList.forEach(async (entry) => {
            const name = await db
                .select({
                    itemName: item.nome,
                })
                .from(inventario)
                .innerJoin(item, eq(inventario.idItem, item.id))
                .where(eq(inventario.id, entry));

            await this.message.reply(
                `O seu item **${name[0].itemName}** quebrou e foi removido do seu inventário`,
            );
        });

        entryList.forEach(async (entry: number) => {
            await db.delete(inventario).where(eq(inventario.id, entry));
        });
    }
    private async updateInventoryEntries(entryList: Array<InventoryItem>) {
        entryList.forEach(async (item: InventoryItem) => {
            await db
                .update(inventario)
                .set({ durabilidadeAtual: item.durability })
                .where(eq(inventario.id, item.inventoryEntryId));
        });
    }
}
