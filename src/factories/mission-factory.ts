import { Colors, EmbedBuilder } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../db/db';
import { mission } from '../db/schema';
import Factory from './base-factory';
import ShowEmbed from './show-embed';

export default class MissionFactory extends Factory<typeof mission> implements ShowEmbed<typeof mission> {
    show(entry: {
        id: number;
        name: string;
        description: string;
        xp: number;
        gold: number;
        difficulty: number;
        guildId: bigint;
    }): EmbedBuilder {
        const missionEmbed = new EmbedBuilder()
            .setTitle(`Missão "${entry.name}"`)
            .setColor(Colors.Red)
            .setDescription(entry.description)
            .setFields([
                { name: '\u200B', value: '\u200B' },
                {
                    name: 'XP',
                    value: `${entry.xp}`,
                    inline: true,
                },
                {
                    name: 'Gold',
                    value: `$${entry.gold}`,
                    inline: true,
                },
                { name: '\u200B', value: '\u200B' },
            ]);

        return missionEmbed;
    }

    async create({
        name,
        description,
        xp,
        gold,
        difficultyId,
        guildId,
    }: {
        name: string;
        description: string;
        xp: number;
        gold: number;
        difficultyId: number;
        guildId: string;
    }): Promise<{
        id: number;
        name: string;
        description: string;
        xp: number;
        gold: number;
        difficulty: number;
        guildId: bigint;
    }> {
        const [createdMission] = await db
            .insert(mission)
            .values({
                name,
                description,
                xp,
                gold,
                difficulty: difficultyId,
                guildId: BigInt(guildId),
            })
            .returning();

        return createdMission;
    }

    async getByName(
        missionName: string,
        guildId: string,
    ): Promise<{
        id: number;
        name: string;
        description: string;
        xp: number;
        gold: number;
        difficulty: number;
        guildId: bigint;
    }> {
        const missions = await this.getAll(guildId);
        return await super.searchEntry(missions, 'name', missionName);
    }

    async getAll(
        guildId: string,
    ): Promise<
        { id: number; name: string; description: string; xp: number; gold: number; difficulty: number; guildId: bigint }[]
    > {
        return await db
            .select()
            .from(mission)
            .where(eq(mission.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        await db.delete(mission).where(eq(mission.id, id));
    }
}
