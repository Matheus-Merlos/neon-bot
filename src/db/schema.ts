import { blob, int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const player = sqliteTable('player', {
    discordId: blob('discord_id', { mode: 'bigint' }).primaryKey(),
});

export const rank = sqliteTable('rank', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    necessaryXp: int('xp').notNull(),
    extraAttributes: int('extra_attributes').notNull(),
    extraHabs: int('extra_habs').notNull(),
    guildId: blob('guild_id', { mode: 'bigint' }).notNull(),
});

export const reachedRank = sqliteTable('reached_rank', {
    id: int('id').primaryKey({ autoIncrement: true }),
    characterId: int('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    rankId: int('rank_id')
        .notNull()
        .references(() => rank.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const item = sqliteTable('item', {
    id: int('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    price: int('price').notNull(),
    durability: int('durability').notNull(),
    canBuy: int('can_buy', { mode: 'boolean' }).notNull(),
    image: text('image'),
    salt: text('salt', { length: 5 }),
    guildId: blob('guild_id', { mode: 'bigint' }).notNull(),
});

export const inventory = sqliteTable('inventory', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    durability: int('durability').notNull(),
    characterId: int('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade' }),
    itemId: int('item_id')
        .notNull()
        .references(() => item.id, { onDelete: 'cascade' }),
});

/*
Objective System
*/
export const objectiveDifficulty = sqliteTable('objective_difficulty', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    guildId: blob('guild_id', { mode: 'bigint' }).notNull(),
});

export const objective = sqliteTable('objective', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    xp: int('xp').notNull(),
    gold: int('gold').notNull(),
    description: text('description').notNull(),
    type: int('type')
        .notNull()
        .references(() => objectiveDifficulty.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    guildId: blob('guild_id', { mode: 'bigint' }).notNull(),
});

export const selectedObjective = sqliteTable('selected_objective', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    objectiveId: int('objective_id')
        .notNull()
        .references(() => objective.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    characterId: int('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const completedObjective = sqliteTable('completed_objective', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    objectiveId: int('objective_id')
        .notNull()
        .references(() => objective.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    characterId: int('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const characterClass = sqliteTable('class', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    guildId: blob('guild_id', { mode: 'bigint' }).notNull(),
});

export const classObjective = sqliteTable('class_objective', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    xp: int('xp').notNull(),
    gold: int('gold').notNull(),
    description: text('description').notNull(),
    classId: int('class')
        .notNull()
        .references(() => characterClass.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    guildId: blob('guild_id', { mode: 'bigint' }).notNull(),
});

export const character = sqliteTable('character', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    xp: int('xp').notNull(),
    gold: int('gold').notNull(),
    player: blob('player', { mode: 'bigint' })
        .references(() => player.discordId, {
            onDelete: 'cascade',
        })
        .notNull(),
    imageUrl: text('image_url'),
    salt: text('salt', { length: 5 }),
    characterClass: int('class').references(() => characterClass.id, { onDelete: 'set null', onUpdate: 'no action' }),
    guildId: blob('guild_id', { mode: 'bigint' }).notNull(),
});

export const completedClassObjective = sqliteTable('completed_class_objective', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    characterId: int('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    classObjectiveId: int('class_objective_id')
        .notNull()
        .references(() => classObjective.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    completed: int('completed', { mode: 'boolean' }).default(false).notNull(),
});
