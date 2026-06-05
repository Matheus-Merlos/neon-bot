import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { ClassObjective, classObjective } from '../../db/schema';
import Factory from '../base-factory';

class ClassObjectiveFactory extends Factory<typeof classObjective> {
    constructor() {
        super(classObjective);
    }

    async getByName(name: string, guildId: string): Promise<ClassObjective> {
        return await this.searchEntry(await this.getAll(guildId), 'name', name);
    }

    async getAll(guildId: string): Promise<Array<ClassObjective>> {
        return await db
            .select()
            .from(classObjective)
            .where(eq(classObjective.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        await db.delete(classObjective).where(eq(classObjective.id, id));
    }
}

export default new ClassObjectiveFactory();
