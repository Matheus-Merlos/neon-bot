import { Colors, EmbedBuilder, Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../db/db';
import { item } from '../db/schema';
import getMostSimilarString from '../utils/levenshtein';

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
        const itemNames = (await db.select({ id: item.id, name: item.name }).from(item)).map(
            (entry) => ({ id: entry.id, name: entry.name.toLowerCase() }),
        );
        const desiredItemName = getMostSimilarString(
            itemNames.map((entry) => entry.name),
            itemName,
        );

        const desiredItemNameId = itemNames.find((item) => item.name === desiredItemName)!.id;

        const [dbItem] = await db.select().from(item).where(eq(item.id, desiredItemNameId));

        return dbItem;
    }

    public static async sendItem(message: Message, item: Item) {
        const itemEmbed = new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(item.name)
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
                    name: ' ',
                    value: ' ',
                    inline: false,
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
            );

        if (item.description !== null) {
            itemEmbed.addFields({
                name: 'Descrição',
                value: item.description,
                inline: false,
            });
        }

        if (item.image !== null) {
            itemEmbed.setImage(item.image);
        }

        await message.reply({ embeds: [itemEmbed] });
    }
}
