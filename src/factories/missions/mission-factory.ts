import { Colors, EmbedBuilder } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { mission } from '../../db/schema';
import { ImageHandler } from '../../utils';
import Factory from '../base-factory';
import ShowEmbed from '../show-embed';

class MissionFactory extends Factory<typeof mission> implements ShowEmbed<typeof mission> {
    constructor() {
        super(mission);
    }

    show(entry: {
        id: number;
        name: string;
        description: string;
        xp: number;
        gold: number;
        difficulty: number;
        guildId: bigint;
        salt: string | null;
        imageUrl: string | null;
        completed: boolean;
    }): EmbedBuilder {
        const missionEmbed = new EmbedBuilder()
            .setTitle(`Missão "${entry.name}"`)
            .setColor(Colors.Red)
            .setDescription(entry.description)
            .setFields([
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
            ])
            .setImage(entry.imageUrl ? entry.imageUrl : '');

        return missionEmbed;
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
        salt: string | null;
        imageUrl: string | null;
        completed: boolean;
    }> {
        const missions = await this.getAll(guildId);
        return await super.searchEntry(missions, 'name', missionName);
    }

    async getAll(guildId: string): Promise<
        {
            id: number;
            name: string;
            description: string;
            xp: number;
            gold: number;
            difficulty: number;
            guildId: bigint;
            salt: string | null;
            imageUrl: string | null;
            completed: boolean;
        }[]
    > {
        return await db
            .select()
            .from(mission)
            .where(eq(mission.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        const [DBMission] = await db.select().from(mission).where(eq(mission.id, id));

        await ImageHandler.deleteImage('missions', DBMission.salt!, DBMission.name);

        await db.delete(mission).where(eq(mission.id, id));
    }
}

export default new MissionFactory();
