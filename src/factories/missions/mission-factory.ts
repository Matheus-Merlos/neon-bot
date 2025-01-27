import { Colors, EmbedBuilder } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { mission } from '../../db/schema';
import downloadImage from '../../utils/download-image';
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

    async create({
        name,
        description,
        xp,
        gold,
        difficultyId,
        guildId,
        imageUrl,
    }: {
        name: string;
        description: string;
        xp: number;
        gold: number;
        difficultyId: number;
        guildId: string;
        imageUrl: string | null;
    }): Promise<{
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
        let salt,
            url = null;
        if (imageUrl) {
            const { stream, contentLenght, contentType } = await downloadImage(imageUrl);

            const img = await ImageFactory.getInstance().uploadImage(
                'missions',
                toSlug(name),
                stream,
                contentType,
                contentLenght,
            );

            salt = img.salt;
            url = img.url;
        }

        const [createdMission] = await db
            .insert(mission)
            .values({
                name,
                description,
                xp,
                gold,
                difficulty: difficultyId,
                guildId: BigInt(guildId),
                salt,
                imageUrl: url,
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
        await db.delete(mission).where(eq(mission.id, id));
    }
}
