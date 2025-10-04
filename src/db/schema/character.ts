import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { characterClass } from './character-class';
import { player } from './player';

export const character = pgTable('character', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    xp: integer('xp').notNull(),
    gold: integer('gold').notNull(),
    player: bigint('player', { mode: 'bigint' })
        .references(() => player.discordId, {
            onDelete: 'cascade',
        })
        .notNull(),
    imageUrl: varchar('image_url', { length: 255 }),
    salt: varchar('salt', { length: 5 }),
    characterClass: integer('class').references(() => characterClass.id, { onDelete: 'set null', onUpdate: 'no action' }),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export type Character = InferSelectModel<typeof character>;
export type NewCharacter = InferInsertModel<typeof character>;
