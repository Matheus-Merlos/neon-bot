import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../db/db';
import { character, player } from '../db/schema';

export default class CharacterFactory {
    public static async getFromId(playerId: string, message: Message) {
        let [char] = await db
            .select()
            .from(character)
            .where(eq(character.player, BigInt(playerId)));
        if (!char) {
            const playerName = (await message.guild!.members.fetch(playerId)).nickname;
            const charName = playerName?.split(' ')[0].replace(',', '');

            await db.insert(player).values({ discordId: BigInt(playerId) });

            [char] = await db
                .insert(character)
                .values({
                    name: charName!,
                    xp: 0,
                    gold: 0,
                    active: true,
                    player: BigInt(playerId),
                })
                .returning();
        }

        return char;
    }
}
