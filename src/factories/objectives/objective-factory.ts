import { asc, eq } from 'drizzle-orm';
import db from '../../db/db';
import { objective } from '../../db/schema';
import getMostSimilarString from '../../utils/levenshtein';
import Factory from '../base-factory';

export default class ObjectiveFactory implements Factory<typeof objective> {
    private static instance: ObjectiveFactory | null = null;

    private constructor() {}

    static getInstance(): ObjectiveFactory {
        if (ObjectiveFactory.instance === null) {
            ObjectiveFactory.instance = new ObjectiveFactory();
        }

        return ObjectiveFactory.instance;
    }

    async create({
        name,
        xp,
        gold,
        difficultyId,
        description,
        guildId,
    }: {
        name: string;
        xp: number;
        gold: number;
        difficultyId: number;
        description: string;
        guildId: string;
    }): Promise<{ id: number; name: string; xp: number; gold: number; type: number; description: string; guildId: bigint }> {
        const [createdObjective] = await db
            .insert(objective)
            .values({ name, xp, gold, type: difficultyId, description, guildId: BigInt(guildId) })
            .returning();

        return createdObjective;
    }

    async getByName(
        objectiveName: string,
        guildId: string,
    ): Promise<{ id: number; name: string; xp: number; gold: number; type: number; description: string; guildId: bigint }> {
        const objectives = (await this.getAll(guildId)).map((entry) => ({
            id: entry.id,
            name: entry.name.toLowerCase(),
        }));

        const desiredObjectiveName = getMostSimilarString(
            objectives.map((diff) => diff.name),
            objectiveName,
        );

        const desiredObjectiveId = objectives.find((obj) => obj.name === desiredObjectiveName)!.id;

        const [diff] = await db.select().from(objective).where(eq(objective.id, desiredObjectiveId));

        return diff;
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
