import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const rule = pgTable('rule', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 127 }).notNull(),
    description: text('description').notNull(),
});

export type Rule = InferSelectModel<typeof rule>;
export type NewRule = InferInsertModel<typeof rule>;
