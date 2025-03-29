import { bigint, boolean, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const player = pgTable('player', {
    discordId: bigint('discord_id', { mode: 'bigint' }).primaryKey(),
});

export const rank = pgTable('rank', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 31 }).notNull(),
    necessaryXp: integer('xp').notNull(),
    extraAttributes: integer('extra_attributes').notNull(),
    extraHabs: integer('extra_habs').notNull(),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export const reachedRank = pgTable('reached_rank', {
    id: serial('id'),
    characterId: integer('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    rankId: integer('rank_id')
        .notNull()
        .references(() => rank.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const item = pgTable('item', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 127 }).notNull(),
    description: text('description'),
    price: integer('price').notNull(),
    durability: integer('durability').notNull(),
    canBuy: boolean('can_buy').notNull(),
    image: varchar('image', { length: 255 }),
    salt: varchar('salt', { length: 5 }),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export const inventory = pgTable('inventory', {
    id: serial('id').primaryKey(),
    durability: integer('durability').notNull(),
    characterId: integer('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade' }),
    itemId: integer('item_id')
        .notNull()
        .references(() => item.id, { onDelete: 'cascade' }),
});

/*
Objective System
*/
export const objectiveDifficulty = pgTable('objective_difficulty', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 31 }).notNull(),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export const objective = pgTable('objective', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 127 }).notNull(),
    xp: integer('xp').notNull(),
    gold: integer('gold').notNull(),
    description: text('description').notNull(),
    type: integer('type')
        .notNull()
        .references(() => objectiveDifficulty.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export const selectedObjective = pgTable('selected_objective', {
    id: serial('id').primaryKey(),
    objectiveId: integer('objective_id')
        .notNull()
        .references(() => objective.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    characterId: integer('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const completedObjective = pgTable('completed_objective', {
    id: serial('id').primaryKey(),
    objectiveId: integer('objective_id')
        .notNull()
        .references(() => objective.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    characterId: integer('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const characterClass = pgTable('class', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 127 }).notNull(),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export const classObjective = pgTable('class_objective', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 127 }).notNull(),
    xp: integer('xp').notNull(),
    gold: integer('gold').notNull(),
    description: text('description').notNull(),
    classId: integer('class')
        .notNull()
        .references(() => characterClass.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export const character = pgTable('character', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    xp: integer('xp').notNull(),
    gold: integer('gold').notNull(),
    player: bigint('player', { mode: 'bigint' })
        .references(() => player.discordId, {
            onDelete: 'cascade',
        })
        .notNull(),
    imageUrl: varchar('image_url', { length: 255 }),
    salt: varchar('salt', { length: 5 }),
    characterClass: integer('class').references(() => characterClass.id, { onDelete: 'set null', onUpdate: 'no action' }),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export const completedClassObjective = pgTable('completed_class_objective', {
    id: serial('id').primaryKey(),
    characterId: integer('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    classObjectiveId: integer('class_objective_id')
        .notNull()
        .references(() => classObjective.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    completed: boolean('completed').default(false).notNull(),
});

/*
Mission System
*/
export const missionDifficulty = pgTable('mission_difficulty', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 31 }).notNull(),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export const mission = pgTable('mission', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    xp: integer('xp').notNull(),
    gold: integer('gold').notNull(),
    difficulty: integer('difficulty')
        .notNull()
        .references(() => missionDifficulty.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    imageUrl: varchar('image_url', { length: 255 }),
    salt: varchar('salt', { length: 5 }),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
    completed: boolean('completed').notNull().default(false),
});

export const missionComplete = pgTable('mission_complete', {
    id: serial('id').primaryKey(),
    characterId: integer('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    missionId: integer('mission_id')
        .notNull()
        .references(() => mission.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});
