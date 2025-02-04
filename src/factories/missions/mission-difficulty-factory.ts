import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { missionDifficulty } from '../../db/schema';
import Factory from '../base-factory';

export default class MissionDifficultyFactory extends Factory<typeof missionDifficulty> {
    private static instance: MissionDifficultyFactory | null = null;

    private constructor() {
        super();
    }

    static getInstance(): MissionDifficultyFactory {
        if (MissionDifficultyFactory.instance === null) {
            MissionDifficultyFactory.instance = new MissionDifficultyFactory();
        }

        return MissionDifficultyFactory.instance;
    }

    async create({ name, guildId }: { name: string; guildId: string }): Promise<{ id: number; name: string; guildId: bigint }> {
        const [createdDifficulty] = await db
            .insert(missionDifficulty)
            .values({ name, guildId: BigInt(guildId) })
            .returning();

        return createdDifficulty;
    }

    async getByName(difficultyName: string, guildId: string): Promise<{ id: number; name: string; guildId: bigint }> {
        return await this.searchEntry(await this.getAll(guildId), 'name', difficultyName);
    }

    async getAll(guildId: string): Promise<{ id: number; name: string; guildId: bigint }[]> {
        return await db
            .select()
            .from(missionDifficulty)
            .where(eq(missionDifficulty.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        await db.delete(missionDifficulty).where(eq(missionDifficulty.id, id));
    }

    async getFromId(id: number): Promise<{ id: number; name: string; guildId: bigint }> {
        const [entry] = await db.select().from(missionDifficulty).where(eq(missionDifficulty.id, id));
        return entry;
    }
}
