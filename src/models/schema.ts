import { decimal, integer, pgTable, serial, smallserial, text, varchar } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const queryClient = postgres('postgres://postgres:postgres@0.0.0.0:5432/neon');
const db = drizzle(queryClient);

export const categoria = pgTable('categoria', {
    id: smallserial('id').primaryKey().notNull(),
    descricao: varchar('descricao', { length: 63 }).notNull(),
});

export const item = pgTable('item', {
    id: serial('id').primaryKey().notNull(),
    nome: varchar('nome', { length: 127 }).notNull(),
    descricao: text('descricao').notNull(),
    preco: decimal('preco', { precision: 10, scale: 2 }),
    durabilidade: integer('durabilidade'),
    categoria: integer('categoria'),
});

export default db;
