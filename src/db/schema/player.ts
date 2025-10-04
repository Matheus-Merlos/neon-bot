import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, pgTable } from 'drizzle-orm/pg-core';

export const player = pgTable('player', {
    discordId: bigint('discord_id', { mode: 'bigint' }).primaryKey(),
});

export type Player = InferSelectModel<typeof player>;
export type NewPlayer = InferInsertModel<typeof player>;
