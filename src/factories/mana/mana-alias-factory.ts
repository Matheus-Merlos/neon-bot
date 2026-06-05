import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { manaAlias, ManaAlias } from '../../db/schema';
import Factory from '../base-factory';

class ManaAliasFactory extends Factory<typeof manaAlias> {
    constructor() {
        super(manaAlias);
    }

    async getByName(name: string, guildId: string): Promise<ManaAlias> {
        return this.searchEntry(await this.getAll(guildId), 'name', name);
    }

    async getAll(guildId: string): Promise<Array<ManaAlias>> {
        return await db
            .select()
            .from(manaAlias)
            .where(eq(manaAlias.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        await db.delete(manaAlias).where(eq(manaAlias.id, id));
    }
}

export default new ManaAliasFactory();
