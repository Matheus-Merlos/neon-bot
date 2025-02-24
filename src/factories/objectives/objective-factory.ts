import { asc, eq } from 'drizzle-orm';
import db from '../../db/db';
import { objective } from '../../db/schema';
import Factory from '../base-factory';

export default class ObjectiveFactory extends Factory<typeof objective> {
    private static instance: ObjectiveFactory | null = null;

    private constructor() {
        super();
    }

    static getInstance(): ObjectiveFactory {
        if (ObjectiveFactory.instance === null) {
            ObjectiveFactory.instance = new ObjectiveFactory();
        }

        return ObjectiveFactory.instance;
    }

    async getByName(
        objectiveName: string,
        guildId: string,
    ): Promise<{ id: number; name: string; xp: number; gold: number; type: number; description: string; guildId: bigint }> {
        return await this.searchEntry(await this.getAll(guildId), 'name', objectiveName);
    }

    async getAll(
        guildId: string,
    ): Promise<{ id: number; name: string; xp: number; gold: number; type: number; description: string; guildId: bigint }[]> {
        return await db
            .select()
            .from(objective)
            .orderBy(asc(objective.xp))
            .where(eq(objective.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        await db.delete(objective).where(eq(objective.id, id));
    }
}
