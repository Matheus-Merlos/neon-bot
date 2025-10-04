import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, integer, pgTable, serial } from 'drizzle-orm/pg-core';
import { character } from './character';
import { classObjective } from './class-objective';

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

export type CompletedClassObjective = InferSelectModel<typeof completedClassObjective>;
export type NewCompletedClassObjective = InferInsertModel<typeof completedClassObjective>;
