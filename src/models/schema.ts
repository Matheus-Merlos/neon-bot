import {
    bigint,
    bigserial,
    boolean,
    integer,
    pgTable,
    serial,
    smallserial,
    text,
    uniqueIndex,
    varchar,
} from 'drizzle-orm/pg-core';

export const jogador = pgTable('jogador', {
    discordId: bigint('discord_id', { mode: 'bigint' }).notNull().primaryKey(),
});

export const npc = pgTable('npc', {
    id: serial('id').notNull().primaryKey(),
    jogador: bigint('jogador', { mode: 'bigint' })
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
    jogador: bigint('jogador', { mode: 'bigint' })
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
    disponivel: boolean('disponivel_para_venda').notNull(),
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
    necessaryXp: integer('necessary_xp').notNull().unique(),
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

export const role = pgTable('role', {
    discordId: bigint('discord_id', { mode: 'bigint' }).notNull().primaryKey(),
    nome: varchar('nome', { length: 63 }).notNull().unique(),
});

//Tabelas para objetivos

export const tipoObjetivo = pgTable('tipo_objetivo', {
    id: smallserial('id').notNull().primaryKey(),
    descricao: varchar('descricao', { length: 63 }).notNull().unique(),
});

export const objetivo = pgTable('objetivo', {
    id: serial('id').notNull().primaryKey(),
    nome: varchar('nome', { length: 63 }).notNull().unique(),
    xp: integer('xp').notNull(),
    gold: integer('xp').notNull(),
    idTipo: integer('id_tipo')
        .notNull()
        .references(() => tipoObjetivo.id),
});

export const objetivosSelecionados = pgTable(
    'objetivos_selecionados',
    {
        id: bigserial('id', { mode: 'bigint' }).notNull().primaryKey(),

        idObjetivo: integer('id_objetivo')
            .notNull()
            .references(() => objetivo.id),

        idPersonagem: integer('id_personagem')
            .notNull()
            .references(() => personagem.id),
    },
    (table) => {
        return {
            uniqueSelectedObjetiveIndex: uniqueIndex('unique_objective_idx').on(
                table.idObjetivo,
                table.idPersonagem,
            ),
        };
    },
);

export const objetivosConcluidos = pgTable('objetivos_concluidos', {
    id: bigserial('id', { mode: 'bigint' }).notNull().primaryKey(),
    idObjetivo: integer('id_objetivo')
        .notNull()
        .references(() => objetivo.id),

    idPersonagem: integer('id_personagem')
        .notNull()
        .references(() => personagem.id),
});
