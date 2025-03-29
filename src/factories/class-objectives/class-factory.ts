import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { characterClass } from '../../db/schema';
import Factory from '../base-factory';

class ClassFactory extends Factory<typeof characterClass> {
    constructor() {
        super(characterClass);
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

export default new ClassFactory();
