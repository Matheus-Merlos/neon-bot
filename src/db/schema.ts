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
    active: int('active', { mode: 'boolean' }).notNull(),
    player: blob('player', { mode: 'bigint' })
        .references(() => player.discordId, {
            onDelete: 'cascade',
        })
        .notNull(),
});

export const reachedRank = sqliteTable('reached_rank', {
    characterId: int('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    rankId: int('rank_id')
        .notNull()
        .references(() => rank.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});
