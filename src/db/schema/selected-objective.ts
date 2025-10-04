import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial } from 'drizzle-orm/pg-core';
import { character } from './character';
import { objective } from './objective';

export const selectedObjective = pgTable('selected_objective', {
    id: serial('id').primaryKey(),
    objectiveId: integer('objective_id')
        .notNull()
        .references(() => objective.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    characterId: integer('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export type SelectedObjective = InferSelectModel<typeof selectedObjective>;
export type NewSelectedObjective = InferInsertModel<typeof selectedObjective>;
