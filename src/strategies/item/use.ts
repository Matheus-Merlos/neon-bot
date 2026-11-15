import { ChatInputCommandInteraction, Message } from 'discord.js';
import { and, asc, eq } from 'drizzle-orm';
import db from '../../db/db';
import { inventory, item as itemTable } from '../../db/schema';
import ItemFactory from '../../factories/item-factory';
import { IStrategy } from '../base-strategy';
import { CharacterFactory } from '../../factories';

type Input = {
    name: string;
    quantity: number;
};

export default class UseStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const userId = 'author' in replyInstance ? replyInstance.author.id : replyInstance.user.id;

        const character = await CharacterFactory.getFromPlayerId(userId, replyInstance.guildId!);

        let { quantity } = input;
        const itemName = input.name;

        let item;
        try {
            item = await ItemFactory.getByName(itemName, replyInstance.guildId!);
        } catch {
            await replyInstance.reply(`Não foi encontrado um item com o nome **${itemName}**.`);
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
            await replyInstance.reply(`Você não possui **${item.name}** em seu inventário.`);
            return;
        }

        let totalDurability = 0;
        inventoryItems
            .map((invItem) => invItem.durability)
            .forEach((invItem) => {
                totalDurability += invItem;
            });

        if (quantity > totalDurability) {
            await replyInstance.reply(
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
        replyInstance.reply(`Você usou **${item.name}** com sucesso.`);
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            name: o.getString('name', true),
            quantity: o.getNumber('quantity') ?? 1,
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        let quantity = 1;

        if (!isNaN(parseInt(messageAsList[0]))) {
            quantity = parseInt(messageAsList[0]);
            messageAsList.splice(0, 1);
        }

        const itemName = messageAsList.join(' ');

        await this.handleInput({ name: itemName, quantity }, message);
    }
}
