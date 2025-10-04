import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, boolean, integer, pgTable, serial, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const item = pgTable(
    'item',
    {
        id: serial('id').primaryKey(),
        name: varchar('name', { length: 127 }).notNull(),
        description: text('description'),
        price: integer('price').notNull(),
        durability: integer('durability').notNull(),
        canBuy: boolean('can_buy').notNull(),
        image: varchar('image', { length: 255 }),
        salt: varchar('salt', { length: 5 }),
        guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
    },
    (table) => [uniqueIndex('unique_guild_item_idx').on(table.name, table.guildId)],
);

export type Item = InferSelectModel<typeof item>;
export type NewItem = InferInsertModel<typeof item>;
