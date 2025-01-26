import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { objectiveDifficulty } from '../../db/schema';
import getMostSimilarString from '../../utils/levenshtein';
import Factory from '../base-factory';

export default class ObjectiveDifficultyFactory implements Factory<typeof objectiveDifficulty> {
    private static instance: ObjectiveDifficultyFactory | null = null;

    private constructor() {}

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
        const difficulties = (await this.getAll(guildId)).map((entry) => ({
            id: entry.id,
            name: entry.name.toLowerCase(),
        }));

        const desiredDifficultyName = getMostSimilarString(
            difficulties.map((diff) => diff.name),
            difficultyName,
        );

        const desiredDifficultyId = difficulties.find((diff) => diff.name === desiredDifficultyName)!.id;

        const [diff] = await db.select().from(objectiveDifficulty).where(eq(objectiveDifficulty.id, desiredDifficultyId));

        return diff;
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
}
