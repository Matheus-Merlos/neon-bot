import { LibsqlError } from '@libsql/client';
import axios from 'axios';
import { and, eq, InferSelectModel } from 'drizzle-orm';
import db from '../db/db';
import { character, player } from '../db/schema';
import client from '../main';
import { ImageHandler } from '../utils';
import getMostSimilarString from '../utils/levenshtein';

export default class CharacterFactory {
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

            const upload = await ImageHandler.getInstance().uploadImage('characters', charName!, image.data);
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

    protected searchEntry(
        entries: Array<InferSelectModel<typeof character>>,
        searchColumn: keyof InferSelectModel<typeof character>,
        searchName: string,
    ): InferSelectModel<typeof character> {
        const entryList = [...entries];

        const entryListLowerCase = entries.map((entry) => ({
            ...entry,
            [searchColumn]: (entry[searchColumn] as string).toLowerCase(),
        }));

        const desiredEntryName = getMostSimilarString(
            entryListLowerCase.map((entry) => entry[searchColumn] as string),
            searchName,
        );

        const desiredEntryNameId = entryList.find(
            (entry) => (entry[searchColumn] as string).toLowerCase() === desiredEntryName,
        )!.id;

        const entry = entryList.find((entry) => entry.id === desiredEntryNameId);

        return entry!;
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
        return this.searchEntry(await this.getAll(guildId), 'name', name);
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

        await ImageHandler.getInstance().deleteImage('characters', char.salt!, char.name);

        await db.delete(character).where(eq(character.id, id));
    }
}
