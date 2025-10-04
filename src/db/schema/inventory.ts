import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial } from 'drizzle-orm/pg-core';
import { character } from './character';
import { item } from './item';

export const inventory = pgTable('inventory', {
    id: serial('id').primaryKey(),
    durability: integer('durability').notNull(),
    characterId: integer('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade' }),
    itemId: integer('item_id')
        .notNull()
        .references(() => item.id, { onDelete: 'cascade' }),
});

export type Inventory = InferSelectModel<typeof inventory>;
export type NewInventory = InferInsertModel<typeof inventory>;
