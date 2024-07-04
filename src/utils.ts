import { and, eq } from 'drizzle-orm';
import db from './models/db';
import { jogador, personagem } from './models/schema';
import { Guild, GuildMember } from 'discord.js';

type Character = {
    characterId: number;
    characterName: string;
};

function getIdFromMention(mention: string): string {
    return mention.slice(2, mention.length - 1);
}

async function addPlayerAndCharacterIfNotExists(playerId: string, guild: Guild): Promise<void> {
    const player = await db
        .select({ playerId: jogador.discordId })
        .from(jogador)
        .where(eq(jogador.discordId, BigInt(playerId)));

    if (player.length !== 0) {
        return;
    }
    const characterName: string = await getCharacterNameFromId(playerId, guild);

    await insertPlayerAndCharacter(playerId, characterName);
}

async function getCharacterNameFromId(playerId: string, guild: Guild): Promise<string> {
    const member: GuildMember = await guild.members.fetch(playerId);
    if (!member) {
        throw new Error('Player with this ID does not exists!');
    }

    let nickname: string | null = member.nickname;
    if (!nickname) {
        nickname = member.displayName;
    }
    const nicknameArray: Array<string> = nickname.split(' ');
    const characterName = nicknameArray[0].replace(',', '');
    return characterName;
}

async function insertPlayerAndCharacter(playerId: string, characterName: string): Promise<void> {
    await db.insert(jogador).values({ discordId: BigInt(playerId) });
    await db.insert(personagem).values({
        nome: characterName,
        xp: 0,
        gold: 0,
        jogador: BigInt(playerId),
        ativo: true,
    });
}

async function getCurrentCharacterFromId(playerId: string): Promise<Character> {
    const characters: Array<Character> = await db
        .select({
            characterId: personagem.id,
            characterName: personagem.nome,
        })
        .from(personagem)
        .where(and(eq(personagem.jogador, BigInt(playerId)), eq(personagem.ativo, true)));

    const character: Character = characters[0];

    if (!character) {
        throw new Error(`Character with ID ${playerId} does not exist`);
    }

    return character;
}

export {
    Character,
    getIdFromMention,
    addPlayerAndCharacterIfNotExists,
    getCharacterNameFromId,
    getCurrentCharacterFromId,
};
