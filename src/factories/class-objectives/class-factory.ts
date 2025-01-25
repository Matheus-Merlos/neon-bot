import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { characterClass } from '../../db/schema';
import getMostSimilarString from '../../utils/levenshtein';
import Factory from '../base-factory';

export default class ClassFactory implements Factory<typeof characterClass> {
    private static instance: ClassFactory | null = null;

    private constructor() {}

    static getInstance(): ClassFactory {
        if (ClassFactory.instance === null) {
            ClassFactory.instance = new ClassFactory();
        }

        return ClassFactory.instance;
    }

    async create(name: string): Promise<{ id: number; name: string; guildId: bigint }> {
        const [createdClass] = await db.insert(characterClass).values({ name: name }).returning();
        return createdClass;
    }

    async getByName(name: string): Promise<{ id: number; name: string; guildId: bigint }> {
        const classes = (await this.getAll()).map((entry) => ({
            id: entry.id,
            name: entry.name.toLowerCase(),
        }));

        const desiredClassName = getMostSimilarString(
            classes.map((cls) => cls.name),
            name,
        );

        const classId = classes.find((cls) => cls.name === desiredClassName)!.id;

        const [cls] = await db.select().from(characterClass).where(eq(characterClass.id, classId));

        return cls;
    }

    async getAll(): Promise<{ id: number; name: string; guildId: bigint }[]> {
        return await db.select().from(characterClass);
    }

    async delete(id: number): Promise<void> {
        await db.delete(characterClass).where(eq(characterClass.id, id));
    }
}
