import { and, eq } from 'drizzle-orm';
import db from '../db/db';
import { NewNPC, npc, NPC } from '../db/schema';
import Factory from './base-factory';

class NpcFactory extends Factory<typeof npc> {
    constructor() {
        super(npc);
    }

    async getActiveNpc(playerId: string, guildId: string) {
        const [activeNpc] = await db
            .select()
            .from(npc)
            .where(
                and(
                    eq(npc.playerDiscordId, BigInt(playerId)),
                    eq(npc.guildId, BigInt(guildId)),
                    eq(npc.isActive, true),
                ),
            );

        return activeNpc;
    }

    async getByName(name: string, guildId: string, playerId: string): Promise<NPC> {
        return this.searchEntry(await this.getAll(guildId, playerId), 'name', name);
    }

    async getAll(guildId: string, playerId: string): Promise<Array<NPC>> {
        return await db
            .select()
            .from(npc)
            .where(
                and(eq(npc.guildId, BigInt(guildId)), eq(npc.playerDiscordId, BigInt(playerId))),
            );
    }

    async edit(id: number, args: Partial<NewNPC>): Promise<NPC> {
        const [editedNpc] = await db.update(npc).set(args).where(eq(npc.id, id)).returning();
        return editedNpc;
    }

    async delete(id: number): Promise<void> {
        await db.delete(npc).where(eq(npc.id, id));
    }
}

export default new NpcFactory();
