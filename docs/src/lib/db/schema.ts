import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const family = sqliteTable('family', {
    id: integer().primaryKey({ autoIncrement: true }),
    description: text().notNull(),
});

export const command = sqliteTable('command', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    slug: text().notNull().unique(),
    description: text().notNull(),
    family: integer()
        .notNull()
        .references(() => family.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});
