import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { characterClass } from '../../db/schema';
import Factory from '../base-factory';

export default class ClassFactory extends Factory<typeof characterClass> {
    private static instance: ClassFactory | null = null;

    private constructor() {
        super();
    }

    static getInstance(): ClassFactory {
        if (ClassFactory.instance === null) {
            ClassFactory.instance = new ClassFactory();
        }

        return ClassFactory.instance;
    }

    async getByName(name: string, guildId: string): Promise<{ id: number; name: string; guildId: bigint }> {
        return await this.searchEntry(await this.getAll(guildId), 'name', name);
    }

    async getAll(guildId: string): Promise<{ id: number; name: string; guildId: bigint }[]> {
        return await db
            .select()
            .from(characterClass)
            .where(eq(characterClass.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        await db.delete(characterClass).where(eq(characterClass.id, id));
    }
}
