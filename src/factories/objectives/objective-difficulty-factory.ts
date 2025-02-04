import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { objectiveDifficulty } from '../../db/schema';
import Factory from '../base-factory';

export default class ObjectiveDifficultyFactory extends Factory<typeof objectiveDifficulty> {
    private static instance: ObjectiveDifficultyFactory | null = null;

    private constructor() {
        super();
    }

    static getInstance(): ObjectiveDifficultyFactory {
        if (ObjectiveDifficultyFactory.instance === null) {
            ObjectiveDifficultyFactory.instance = new ObjectiveDifficultyFactory();
        }

        return ObjectiveDifficultyFactory.instance;
    }

    async create(name: string, guildId: string): Promise<{ id: number; name: string; guildId: bigint }> {
        const [createdObjectiveDifficulty] = await db
            .insert(objectiveDifficulty)
            .values({ name, guildId: BigInt(guildId) })
            .returning();

        return createdObjectiveDifficulty;
    }

    async getByName(difficultyName: string, guildId: string): Promise<{ id: number; name: string; guildId: bigint }> {
        return await this.searchEntry(await this.getAll(guildId), 'name', difficultyName);
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
