import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { objectiveDifficulty } from './objective-difficulty';

export const objective = pgTable('objective', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 127 }).notNull(),
    xp: integer('xp').notNull(),
    gold: integer('gold').notNull(),
    description: text('description').notNull(),
    type: integer('type')
        .notNull()
        .references(() => objectiveDifficulty.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export type Objective = InferSelectModel<typeof objective>;
export type NewObjective = InferInsertModel<typeof objective>;
