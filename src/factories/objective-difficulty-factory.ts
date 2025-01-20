import { eq } from 'drizzle-orm';
import db from '../db/db';
import { objectiveDifficulty } from '../db/schema';
import getMostSimilarString from '../utils/levenshtein';
import { default as Factory } from './base-factory';

export default class ObjectiveDifficultyFactory implements Factory<typeof objectiveDifficulty> {
    private static instance: ObjectiveDifficultyFactory | null = null;

    private constructor() {}

    static getInstance(): ObjectiveDifficultyFactory {
        if (ObjectiveDifficultyFactory.instance === null) {
            ObjectiveDifficultyFactory.instance = new ObjectiveDifficultyFactory();
        }

        return ObjectiveDifficultyFactory.instance;
    }

    async create(name: string): Promise<{ id: number; name: string }> {
        const [createdObjectiveDifficulty] = await db.insert(objectiveDifficulty).values({ name }).returning();

        return createdObjectiveDifficulty;
    }

    async getByName(difficultyName: string): Promise<{ id: number; name: string }> {
        const difficulties = (await this.getAll()).map((entry) => ({
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

    async getAll(): Promise<{ id: number; name: string }[]> {
        return db.select().from(objectiveDifficulty);
    }

    async delete(id: number): Promise<void> {
        await db.delete(objectiveDifficulty).where(eq(objectiveDifficulty.id, id));
    }
}
