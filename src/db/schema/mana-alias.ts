import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { character } from './character';

export const manaAlias = pgTable('mana_alias', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    value: integer('value').notNull(),
    character: integer('character')
        .notNull()
        .references(() => character.id),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export type ManaAlias = InferSelectModel<typeof manaAlias>;
export type NewManaAlias = InferInsertModel<typeof manaAlias>;
