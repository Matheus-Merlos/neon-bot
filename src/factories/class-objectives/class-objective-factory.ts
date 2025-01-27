import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { classObjective } from '../../db/schema';
import Factory from '../base-factory';

export default class ClassObjectiveFactory extends Factory<typeof classObjective> {
    private static instance: ClassObjectiveFactory | null = null;

    private constructor() {
        super();
    }

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
        return await this.searchEntry(await this.getAll(guildId), 'name', name);
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
