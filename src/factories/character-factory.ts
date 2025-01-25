import { LibsqlError } from '@libsql/client';
import axios from 'axios';
import { and, eq } from 'drizzle-orm';
import db from '../db/db';
import { character, player } from '../db/schema';
import client from '../main';
import getMostSimilarString from '../utils/levenshtein';
import Factory from './base-factory';
import ImageFactory from './image-factory';

export default class CharacterFactory implements Factory<typeof character> {
    private static instance: CharacterFactory | null = null;

    private constructor() {}

    static getInstance(): CharacterFactory {
        if (CharacterFactory.instance === null) {
            CharacterFactory.instance = new CharacterFactory();
        }

        return CharacterFactory.instance;
    }

    async create(
        playerId: string,
        guildId: string,
    ): Promise<{
        id: number;
        name: string;
        guildId: bigint;
        xp: number;
        gold: number;
        player: bigint;
        imageUrl: string | null;
        salt: string | null;
        characterClass: number | null;
    }> {
        const guild = await client.getClient.guilds.fetch(guildId);
        const guildPlayer = await guild.members.fetch(playerId);

        const playerName = guildPlayer.nickname;
        const charName = playerName?.split(' ')[0].replace(',', '');

        let url = null;
        let salt = null;
        try {
            const imgUrl = guildPlayer.displayAvatarURL({
                extension: 'png',
                size: 512,
            });

            const image = await axios.get(imgUrl, { responseType: 'stream' });

            const contentLenght: number = image.headers['content-length'];

            const upload = await ImageFactory.getInstance().uploadImage(
                'characters',
                `${charName!}.png`,
                image.data,
                'image/png',
                contentLenght,
            );
            url = upload.url;
            salt = upload.salt;
        } catch {
            //pass
        }

        try {
            await db.insert(player).values({ discordId: BigInt(playerId) });
        } catch (error) {
            if (error instanceof LibsqlError && error.message.includes('UNIQUE')) {
                // pass
            }
        }

        const [char] = await db
            .insert(character)
            .values({
                name: charName!,
                xp: 0,
                gold: 0,
                player: BigInt(playerId),
                imageUrl: url,
                salt,
                guildId: BigInt(guildId),
            })
            .returning();

        return char;
    }

    async getFromPlayerId(
        playerId: string,
        guildId: string,
    ): Promise<{
        id: number;
        name: string;
        guildId: bigint;
        xp: number;
        gold: number;
        player: bigint;
        imageUrl: string | null;
        salt: string | null;
        characterClass: number | null;
    }> {
        let [char] = await db
            .select()
            .from(character)
            .where(and(eq(character.player, BigInt(playerId)), eq(character.guildId, BigInt(guildId))));

        if (!char) {
            char = await this.create(playerId, guildId);
        }

        return char;
    }

    async getByName(
        name: string,
        guildId: string,
    ): Promise<{
        id: number;
        name: string;
        guildId: bigint;
        xp: number;
        gold: number;
        player: bigint;
        imageUrl: string | null;
        salt: string | null;
        characterClass: number | null;
    }> {
        const chars = (await this.getAll(guildId)).map((entry) => ({
            id: entry.id,
            name: entry.name.toLowerCase(),
        }));

        const charName = getMostSimilarString(
            chars.map((chr) => chr.name),
            name,
        );

        const charId = chars.find((chr) => chr.name === charName)!.id;

        const [char] = await db.select().from(character).where(eq(character.id, charId));

        return char;
    }

    async getAll(guildId: string): Promise<
        {
            id: number;
            name: string;
            guildId: bigint;
            xp: number;
            gold: number;
            player: bigint;
            imageUrl: string | null;
            salt: string | null;
            characterClass: number | null;
        }[]
    > {
        return await db
            .select()
            .from(character)
            .where(eq(character.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        const [char] = await db.select().from(character).where(eq(character.id, id));

        await ImageFactory.getInstance().deleteImage('characters', `${char.salt}-${char.name}.png`);

        await db.delete(character).where(eq(character.id, id));
    }
}
