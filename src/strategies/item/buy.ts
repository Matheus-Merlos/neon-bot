import { ChatInputCommandInteraction, Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, inventory } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import ItemFactory from '../../factories/item-factory';
import Strategy, { IStrategy } from '../base-strategy';

type Input = {
    name: string;
    quantity: number;
};

export default class BuyStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const itemName = input.name;
        const { quantity } = input;
        let item;

        try {
            item = await ItemFactory.getByName(itemName, replyInstance.guildId!);
        } catch {
            await replyInstance.reply(`Não foi encontrado um item com o nome **${itemName}**.`);
            return;
        }

        const userId = 'author' in replyInstance ? replyInstance.author.id : replyInstance.user.id;
        const char = await CharacterFactory.getFromPlayerId(userId, replyInstance.guild!.id);

        const totalPrice = item.price * quantity;

        if (char.gold < totalPrice) {
            replyInstance.reply(`
Você não tem dinheiro o suficiente para fazer essa compra.
> - Dinheiro necessário: **${totalPrice}**
> - Seu dinheiro: **${char.gold}**
            `);
            return;
        }

        const itemsToInsert = Array.from({ length: quantity }, () => ({
            itemId: item.id,
            characterId: char.id,
            durability: item.durability,
        }));

        await db.transaction(async (trx) => {
            await trx
                .update(character)
                .set({ gold: char.gold - totalPrice })
                .where(eq(character.id, char.id));

            await trx.insert(inventory).values(itemsToInsert);
        });

        replyInstance.reply(`Você comprou com sucesso **${quantity}**x **${item.name}**`);
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const item = {
            name: o.getString('name', true),
            quantity: o.getNumber('quantity') ?? 1,
        };

        await this.handleInput(item, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        let quantity = 1;

        if (!isNaN(parseInt(messageAsList[0]))) {
            quantity = parseInt(messageAsList[0]);
            messageAsList.splice(0, 1);
        }

        if (quantity > 100) {
            await message.reply('O máximo de itens que você pode comprar por comando é 100.');
            return;
        }

        const itemName = messageAsList.join(' ');

        await this.handleInput({ name: itemName, quantity }, message);
    }
}
