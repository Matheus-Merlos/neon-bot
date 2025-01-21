import db from '../../db/db';
import { classObjective } from '../../db/schema';
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

    getByName(
        ...params: Array<unknown>
    ): Promise<{ id: number; name: string; xp: number; gold: number; description: string; classId: number }> {
        throw new Error('Method not implemented.');
    }

    getAll(
        ...params: Array<unknown>
    ): Promise<{ id: number; name: string; xp: number; gold: number; description: string; classId: number }[]> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
