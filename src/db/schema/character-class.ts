import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const characterClass = pgTable('class', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 127 }).notNull(),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export type CharacterClass = InferSelectModel<typeof characterClass>;
export type NewCharacterClass = InferInsertModel<typeof characterClass>;
