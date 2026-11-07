import { eq } from 'drizzle-orm';
import db from '../db/db';
import { System, system } from '../db/schema';
import Factory from './base-factory';

class SystemFactory extends Factory<typeof system> {
    constructor() {
        super(system);
    }

    async getByName(systemName: string, guildId: string): Promise<System> {
        return this.searchEntry(await this.getAll(guildId), 'name', systemName);
    }

    async getAll(guildId: string): Promise<Array<System>> {
        return await db
            .select()
            .from(system)
            .where(eq(system.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        await db.delete(system).where(eq(system.id, id));
    }

    async getFromId(id: number): Promise<System> {
        const [entry] = await db.select().from(system).where(eq(system.id, id));
        return entry;
    }
}

export default new SystemFactory();
