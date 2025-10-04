import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const rank = pgTable('rank', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 31 }).notNull(),
    necessaryXp: integer('xp').notNull(),
    extraAttributes: integer('extra_attributes').notNull(),
    extraHabs: integer('extra_habs').notNull(),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export type Rank = InferSelectModel<typeof rank>;
export type NewRank = InferInsertModel<typeof rank>;
