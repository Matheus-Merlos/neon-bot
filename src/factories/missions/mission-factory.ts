import { Colors, EmbedBuilder } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { mission } from '../../db/schema';
import toSlug from '../../utils/slug';
import Factory from '../base-factory';
import ImageFactory from '../image-factory';
import ShowEmbed from '../show-embed';

export default class MissionFactory extends Factory<typeof mission> implements ShowEmbed<typeof mission> {
    private static instance: MissionFactory | null = null;

    private constructor() {
        super();
    }

    static getInstance(): MissionFactory {
        if (MissionFactory.instance === null) {
            MissionFactory.instance = new MissionFactory();
        }

        return MissionFactory.instance;
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

        await ImageFactory.getInstance().deleteImage('missions', `${DBMission.salt}-${toSlug(DBMission.name)}.png`);

        await db.delete(mission).where(eq(mission.id, id));
    }
}
