import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { classObjective } from '../../db/schema';
import getMostSimilarString from '../../utils/levenshtein';
import Factory from '../base-factory';

export default class ClassObjectiveFactory implements Factory<typeof classObjective> {
    private static instance: ClassObjectiveFactory | null = null;

    private constructor() {}

    static getInstance(): ClassObjectiveFactory {
        if (ClassObjectiveFactory.instance === null) {
            ClassObjectiveFactory.instance = new ClassObjectiveFactory();
        }

        return ClassObjectiveFactory.instance;
    }

    async create(
        name: string,
        xp: number,
        gold: number,
        classId: number,
        guildId: string,
        description: string,
    ): Promise<{ id: number; name: string; xp: number; gold: number; description: string; classId: number; guildId: bigint }> {
        const [createdClassObjective] = await db
            .insert(classObjective)
            .values({ name, xp, gold, classId, description, guildId: BigInt(guildId) })
            .returning();

        return createdClassObjective;
    }

    async getByName(
        name: string,
        guildId: string,
    ): Promise<{ id: number; name: string; xp: number; gold: number; description: string; classId: number; guildId: bigint }> {
        const classObjectives = (await this.getAll(guildId)).map((entry) => ({
            id: entry.id,
            name: entry.name.toLowerCase(),
        }));

        const desiredClassObjectiveName = getMostSimilarString(
            classObjectives.map((cls) => cls.name),
            name,
        );

        const objectiveId = classObjectives.find((cls) => cls.name === desiredClassObjectiveName)!.id;

        const [cls] = await db.select().from(classObjective).where(eq(classObjective.id, objectiveId));

        return cls;
    }

    async getAll(
        guildId: string,
    ): Promise<
        { id: number; name: string; xp: number; gold: number; description: string; classId: number; guildId: bigint }[]
    > {
        return await db
            .select()
            .from(classObjective)
            .where(eq(classObjective.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        await db.delete(classObjective).where(eq(classObjective.id, id));
    }
}
