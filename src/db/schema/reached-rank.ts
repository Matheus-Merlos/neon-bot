import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial } from 'drizzle-orm/pg-core';
import { character } from './character';
import { rank } from './rank';

export const reachedRank = pgTable('reached_rank', {
    id: serial('id'),
    characterId: integer('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    rankId: integer('rank_id')
        .notNull()
        .references(() => rank.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export type ReachedRank = InferSelectModel<typeof reachedRank>;
export type NewReachedRank = InferInsertModel<typeof reachedRank>;
