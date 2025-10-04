import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { characterClass } from './character-class';

export const classObjective = pgTable('class_objective', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 127 }).notNull(),
    xp: integer('xp').notNull(),
    gold: integer('gold').notNull(),
    description: text('description').notNull(),
    classId: integer('class')
        .notNull()
        .references(() => characterClass.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export type ClassObjective = InferSelectModel<typeof classObjective>;
export type NewClassObjective = InferInsertModel<typeof classObjective>;
