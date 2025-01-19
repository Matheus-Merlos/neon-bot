import { blob, int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const player = sqliteTable('player', {
    discordId: blob('discord_id', { mode: 'bigint' }).primaryKey(),
});

export const rank = sqliteTable('rank', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    necessaryXp: int('xp').notNull(),
    extraAttributes: int('extra_attributes').notNull(),
    extraHabs: int('extra_habs').notNull(),
});

export const character = sqliteTable('character', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    xp: int('xp').notNull(),
    gold: int('gold').notNull(),
    player: blob('player', { mode: 'bigint' })
        .references(() => player.discordId, {
            onDelete: 'cascade',
        })
        .notNull()
        .unique(),
    imageUrl: text('image_url'),
    salt: text('salt', { length: 5 }),
});

export const reachedRank = sqliteTable('reached_rank', {
    id: int('id').primaryKey({ autoIncrement: true }),
    characterId: int('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    rankId: int('rank_id')
        .notNull()
        .references(() => rank.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const itemCategory = sqliteTable('item_category', {
    id: int('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
});

export const item = sqliteTable('item', {
    id: int('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
    description: text('description'),
    price: int('price').notNull(),
    durability: int('durability').notNull(),
    canBuy: int('can_buy', { mode: 'boolean' }).notNull(),
    category: int('category').references(() => itemCategory.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),
    image: text('image'),
    salt: text('salt', { length: 5 }),
});

export const inventory = sqliteTable('inventory', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    durability: int('durability').notNull(),
    characterId: int('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade' }),
    itemId: int('item_id')
        .notNull()
        .references(() => item.id, { onDelete: 'cascade' }),
});
