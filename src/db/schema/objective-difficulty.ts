import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const objectiveDifficulty = pgTable('objective_difficulty', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 31 }).notNull(),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export type ObjectiveDifficulty = InferSelectModel<typeof objectiveDifficulty>;
export type NewObjectiveDifficulty = InferInsertModel<typeof objectiveDifficulty>;
