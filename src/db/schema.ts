import { blob, int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const player = sqliteTable('player', {
    discordId: blob('discord_id', { mode: 'bigint' }).primaryKey(),
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
