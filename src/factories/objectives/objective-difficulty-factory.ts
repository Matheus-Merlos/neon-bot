import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { objectiveDifficulty } from '../../db/schema';
import Factory from '../base-factory';

class ObjectiveDifficultyFactory extends Factory<typeof objectiveDifficulty> {
    constructor() {
        super(objectiveDifficulty);
    }

    async getByName(difficultyName: string, guildId: string): Promise<{ id: number; name: string; guildId: bigint }> {
        return this.searchEntry(await this.getAll(guildId), 'name', difficultyName);
    }

    async getAll(guildId: string): Promise<{ id: number; name: string; guildId: bigint }[]> {
        return db
            .select()
            .from(objectiveDifficulty)
            .where(eq(objectiveDifficulty.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        await db.delete(objectiveDifficulty).where(eq(objectiveDifficulty.id, id));
    }

    async getFromId(id: number): Promise<{ id: number; name: string; guildId: bigint }> {
        const [entry] = await db.select().from(objectiveDifficulty).where(eq(objectiveDifficulty.id, id));
        return entry;
    }
}

export default new ObjectiveDifficultyFactory();
