import { Colors, EmbedBuilder } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../db/db';
import { item } from '../db/schema';
import getMostSimilarString from '../utils/levenshtein';
import toSlug from '../utils/slug';
import Factory from './base-factory';
import ImageFactory from './image-factory';
import ShowEmbed from './show-embed';

export default class ItemFactory implements Factory<typeof item>, ShowEmbed<typeof item> {
    private static instance: ItemFactory | null = null;

    private constructor() {}

    static getInstance(): ItemFactory {
        if (ItemFactory.instance === null) {
            ItemFactory.instance = new ItemFactory();
        }

        return ItemFactory.instance;
    }

    async create(
        name: string,
        description: string,
        imageStream: string | null,
        contentType: string | null,
        contentLenght: number | null,
        price: number,
        durability: number,
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
        let salt = null;
        let url = null;
        if (imageStream !== null) {
            const upload = await ImageFactory.getInstance().uploadImage(
                'items',
                `${toSlug(name)}.png`,
                imageStream,
                contentType,
                contentLenght,
            );

            url = upload.url;
            salt = upload.salt;
        }

        const [createdItem] = await db
            .insert(item)
            .values({
                name,
                description,
                image: url,
                price,
                durability,
                canBuy: true,
                salt,
                guildId: BigInt(guildId),
            })
            .returning();

        return createdItem;
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
        const itemNames = (await this.getAll(guildId)).map((entry) => ({
            id: entry.id,
            name: entry.name.toLowerCase(),
        }));
        const desiredItemName = getMostSimilarString(
            itemNames.map((entry) => entry.name),
            name,
        );

        const desiredItemNameId = itemNames.find((item) => item.name === desiredItemName)!.id;

        const [dbItem] = await db.select().from(item).where(eq(item.id, desiredItemNameId));

        return dbItem;
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
