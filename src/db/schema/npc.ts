import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, boolean, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const npc = pgTable('npc', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    guildId: bigint('guild_id', { mode: 'bigint' }).notNull(),
    playerDiscordId: bigint('discord_id', { mode: 'bigint' }).notNull(),
    webhookId: bigint('webhook_id', { mode: 'bigint' }).notNull(),
    webhookToken: varchar('webhook_token', { length: 512 }).notNull(),
    isActive: boolean('is_active').default(false).notNull(),
});

export type NPC = InferSelectModel<typeof npc>;
export type NewNPC = InferInsertModel<typeof npc>;
