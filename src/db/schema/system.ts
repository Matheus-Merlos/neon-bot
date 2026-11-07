import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const system = pgTable('system', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 127 }).notNull(),
    description: text('description').notNull(),
});

export type System = InferSelectModel<typeof system>;
export type NewSystem = InferInsertModel<typeof system>;
