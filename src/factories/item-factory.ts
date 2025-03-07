import { Colors, EmbedBuilder } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../db/db';
import { item } from '../db/schema';
import toSlug from '../utils/slug';
import Factory from './base-factory';
import ImageFactory from './image-factory';
import ShowEmbed from './show-embed';

export default class ItemFactory extends Factory<typeof item> implements ShowEmbed<typeof item> {
    private static instance: ItemFactory | null = null;

    private constructor() {
        super(item);
    }

    static getInstance(): ItemFactory {
        if (ItemFactory.instance === null) {
            ItemFactory.instance = new ItemFactory();
        }

        return ItemFactory.instance;
    }

    async getByName(
        name: string,
        guildId: string,
    ): Promise<{
        id: number;
        name: string;
        description: string | null;
        price: number;
        durability: number;
        canBuy: boolean;
        image: string | null;
        salt: string | null;
        guildId: bigint;
    }> {
        return await this.searchEntry(await this.getAll(guildId), 'name', name);
    }

    async getAll(guildId: string): Promise<
        {
            id: number;
            name: string;
            description: string | null;
            price: number;
            durability: number;
            canBuy: boolean;
            image: string | null;
            salt: string | null;
            guildId: bigint;
        }[]
    > {
        return await db
            .select()
            .from(item)
            .where(eq(item.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        const [DBItem] = await db.select().from(item).where(eq(item.id, id));

        await ImageFactory.getInstance().deleteImage('items', `${DBItem.salt}-${toSlug(DBItem.name)}.png}.png`);

        await db.delete(item).where(eq(item.id, id));
    }

    show(entry: {
        id: number;
        guildId: bigint;
        name: string;
        salt: string | null;
        description: string | null;
        durability: number;
        price: number;
        canBuy: boolean;
        image: string | null;
    }): EmbedBuilder {
        const itemEmbed = new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(entry.name)
            .setFields(
                {
                    name: 'Nome',
                    value: entry.name,
                    inline: true,
                },
                {
                    name: 'Preço',
                    value: `$${entry.price}`,
                    inline: true,
                },
                {
                    name: ' ',
                    value: ' ',
                    inline: false,
                },
                {
                    name: 'Comprável?',
                    value: entry.canBuy === true ? 'Sim' : 'Não',
                    inline: true,
                },
                {
                    name: 'Durabilidade',
                    value: `${entry.durability}`,
                    inline: true,
                },
            );

        if (entry.description !== null) {
            itemEmbed.addFields({
                name: 'Descrição',
                value: entry.description,
                inline: false,
            });
        }

        if (entry.image !== null) {
            itemEmbed.setImage(entry.image);
        }

        return itemEmbed;
    }
}
