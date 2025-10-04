import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial } from 'drizzle-orm/pg-core';
import { character } from './character';
import { mission } from './mission';

export const missionComplete = pgTable('mission_complete', {
    id: serial('id').primaryKey(),
    characterId: integer('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    missionId: integer('mission_id')
        .notNull()
        .references(() => mission.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export type MissionComplete = InferSelectModel<typeof missionComplete>;
export type NewMissionComplete = InferInsertModel<typeof missionComplete>;
