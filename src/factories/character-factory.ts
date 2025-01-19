import { LibsqlError } from '@libsql/client';
import axios from 'axios';
import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../db/db';
import { character, player } from '../db/schema';
import ImageFactory from './image-factory';

export default class CharacterFactory {
    public static async getFromId(playerId: string, message: Message) {
        let [char] = await db
            .select()
            .from(character)
            .where(eq(character.player, BigInt(playerId)));
        if (!char) {
            const guildPlayer = await message.guild!.members.fetch(playerId);
            const playerName = guildPlayer.nickname;
            const charName = playerName?.split(' ')[0].replace(',', '');

            const imgUrl = guildPlayer.displayAvatarURL({
                extension: 'png',
                size: 512,
            });

            let image;
            let url = null;
            let salt = null;
            try {
                image = await axios.get(imgUrl, { responseType: 'stream' });

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
            } catch (error: unknown) {
                if (error instanceof Error) {
                    message.reply(
                        `Erro ao fazer o download da imagem: ${error.name}:${error.message}`,
                    );
                }
            }

            try {
                await db.insert(player).values({ discordId: BigInt(playerId) });
            } catch (error) {
                if (error instanceof LibsqlError && error.message.includes('UNIQUE')) {
                    // pass
                }
            }

            [char] = await db
                .insert(character)
                .values({
                    name: charName!,
                    xp: 0,
                    gold: 0,
                    player: BigInt(playerId),
                    imageUrl: url,
                    salt,
                })
                .returning();
        }

        return char;
    }
}
