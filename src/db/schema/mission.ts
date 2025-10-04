import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, boolean, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { missionDifficulty } from './mission-difficulty';

export const mission = pgTable('mission', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    xp: integer('xp').notNull(),
    gold: integer('gold').notNull(),
    difficulty: integer('difficulty')
        .notNull()
        .references(() => missionDifficulty.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    imageUrl: varchar('image_url', { length: 255 }),
    salt: varchar('salt', { length: 5 }),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
    completed: boolean('completed').notNull().default(false),
});

export type Mission = InferSelectModel<typeof mission>;
export type NewMission = InferInsertModel<typeof mission>;
