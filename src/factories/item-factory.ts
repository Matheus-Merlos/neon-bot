import { Colors, EmbedBuilder, Message } from 'discord.js';
import { sql } from 'drizzle-orm';
import db from '../db/db';
import { item } from '../db/schema';
import { getMostSimilarString } from '../utils';

type Item = {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    price: number;
    durability: number;
    canBuy: boolean;
    category: number | null;
};

export default class ItemFactory {
    public static async getFromName(itemName: string) {
        const itemNames = (await db.select({ name: item.name }).from(item)).map(
            (entry) => entry.name,
        );
        const desiredItemName = getMostSimilarString(itemNames, itemName);

        const [dbItem] = await db
            .select()
            .from(item)
            .where(sql`lower(${item.name}) = ${desiredItemName}`);

        return dbItem;
    }

    public static async sendItem(message: Message, item: Item) {
        const itemEmbed = new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(item.name)
            .setImage(item.image)
            .setFields(
                {
                    name: 'Nome',
                    value: item.name,
                    inline: true,
                },
                {
                    name: 'Preço',
                    value: `$${item.price}`,
                    inline: true,
                },
                {
                    name: 'Comprável?',
                    value: item.canBuy === true ? 'Sim' : 'Não',
                    inline: true,
                },
                {
                    name: 'Durabilidade',
                    value: `${item.durability}`,
                    inline: true,
                },
                {
                    name: 'Descrição',
                    value: item.description!,
                    inline: false,
                },
            );

        await message.reply({ embeds: [itemEmbed] });
    }
}
