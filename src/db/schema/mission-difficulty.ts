import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const missionDifficulty = pgTable('mission_difficulty', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 31 }).notNull(),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
});

export type MissionDifficulty = InferSelectModel<typeof missionDifficulty>;
export type NewMissionDifficulty = InferInsertModel<typeof missionDifficulty>;
