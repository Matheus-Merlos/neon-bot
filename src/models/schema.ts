import {
    bigint,
    boolean,
    integer,
    pgTable,
    serial,
    smallserial,
    text,
    varchar,
} from 'drizzle-orm/pg-core';

export const jogador = pgTable('jogador', {
    discordId: bigint('discord_id', { mode: 'number' }).notNull().primaryKey(),
});

export const npc = pgTable('npc', {
    id: serial('id').notNull().primaryKey(),
    jogador: bigint('jogador', { mode: 'number' })
        .notNull()
        .references(() => jogador.discordId),
    sintaxe: varchar('sintaxe', { length: 15 }).notNull(),
    webhookDiscordId: text('webhook_discord_id').notNull(),
    webhookToken: text('webhook_token').notNull(),
});

export const personagem = pgTable('personagem', {
    id: serial('id').notNull().primaryKey(),
    nome: varchar('nome', { length: 127 }).notNull(),
    xp: integer('xp').notNull(),
    gold: integer('gold').notNull(),
    jogador: bigint('jogador', { mode: 'number' })
        .notNull()
        .references(() => jogador.discordId),
    ativo: boolean('ativo').notNull(),
});

export const categoria = pgTable('categoria', {
    id: smallserial('id').primaryKey().notNull(),
    descricao: varchar('descricao', { length: 63 }).notNull(),
});

export const item = pgTable('item', {
    id: serial('id').primaryKey().notNull(),
    nome: varchar('nome', { length: 127 }).notNull(),
    descricao: text('descricao').notNull(),
    preco: integer('preco').notNull(),
    durabilidade: integer('durabilidade').notNull(),
    categoria: integer('categoria')
        .notNull()
        .references(() => categoria.id),
});

export const inventario = pgTable('inventario', {
    id: serial('id'),
    idItem: integer('id_item')
        .notNull()
        .references(() => item.id),
    idPersonagem: integer('id_personagem')
        .notNull()
        .references(() => personagem.id),
    durabilidadeAtual: integer('durabilidade_atual').notNull(),
});

export const rank = pgTable('rank', {
    id: smallserial('id').notNull().primaryKey(),
    descricao: varchar('descricao', { length: 63 }).notNull(),
});

export const rankPersonagem = pgTable('rank_personagem', {
    id: serial('id'),
    idRank: integer('id_rank')
        .notNull()
        .references(() => rank.id),
    idPersonagem: integer('id_personagem')
        .notNull()
        .references(() => personagem.id),
});
