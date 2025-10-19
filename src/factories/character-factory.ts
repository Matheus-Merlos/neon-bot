import { LibsqlError } from '@libsql/client';
import axios from 'axios';
import { and, eq, InferSelectModel } from 'drizzle-orm';
import db from '../db/db';
import { Character, character, player } from '../db/schema';
import client from '../main';
import { ImageHandler } from '../utils';
import getMostSimilarString from '../utils/levenshtein';
import Factory from './base-factory';

class CharacterFactory extends Factory<typeof character> {
    constructor() {
        super(character);
    }

    async createCharacter(playerId: string, guildId: string): Promise<Character> {
        const guild = await client.getClient.guilds.fetch(guildId);
        const guildPlayer = await guild.members.fetch(playerId);

        const playerName =
            guildPlayer.nickname ?? guildPlayer.user.displayName ?? guildPlayer.user.username;
        const charName = playerName?.split(' ')[0].replace(',', '');

        const imgUrl = guildPlayer.displayAvatarURL({
            extension: 'png',
            size: 512,
        });

        const image = await axios.get(imgUrl, { responseType: 'stream' });

        const { url, salt } = await ImageHandler.uploadImage('characters', charName!, image.data);

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

    async getFromPlayerId(playerId: string, guildId: string): Promise<Character> {
        let [char] = await db
            .select()
            .from(character)
            .where(
                and(eq(character.player, BigInt(playerId)), eq(character.guildId, BigInt(guildId))),
            );

        if (!char) {
            char = await this.createCharacter(playerId, guildId);
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

    async getByName(name: string, guildId: string): Promise<Character> {
        return this.searchEntry(await this.getAll(guildId), 'name', name);
    }

    async edit(id: number, values: Partial<Character>): Promise<Character> {
        const [editedCharacter] = await db
            .update(character)
            .set(values)
            .where(eq(character.id, id))
            .returning();

        return editedCharacter;
    }

    async getAll(guildId: string): Promise<Array<Character>> {
        return await db
            .select()
            .from(character)
            .where(eq(character.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        const [char] = await db.select().from(character).where(eq(character.id, id));

        await ImageHandler.deleteImage('characters', char.salt!, char.name);

        await db.delete(character).where(eq(character.id, id));
    }
}

export default new CharacterFactory();
