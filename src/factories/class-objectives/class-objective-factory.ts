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
        description: string,
    ): Promise<{ id: number; name: string; xp: number; gold: number; description: string; classId: number }> {
        const [createdClassObjective] = await db
            .insert(classObjective)
            .values({ name, xp, gold, classId, description })
            .returning();

        return createdClassObjective;
    }

    async getByName(
        name: string,
    ): Promise<{ id: number; name: string; xp: number; gold: number; description: string; classId: number }> {
        const classObjectives = (await this.getAll()).map((entry) => ({
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

    async getAll(): Promise<{ id: number; name: string; xp: number; gold: number; description: string; classId: number }[]> {
        return await db.select().from(classObjective);
    }

    delete(id: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
