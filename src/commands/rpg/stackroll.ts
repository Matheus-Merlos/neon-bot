import { addPlayerAndCharacterIfNotExists, getIdFromMention } from '../../utils';
import { jogador, personagem } from '../../models/schema';
import db from '../../models/db';
import Command from '../command';
import { eq } from 'drizzle-orm';
import { Guild } from 'discord.js';

type PlayerCharacter = {
    playerId: bigint;
    characterName: string;
};

type CharacterRoll = {
    characterName: string;
    result: number;
};

export default class StackRoll extends Command {
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');

        const idList: Array<string> = msgArray
            .filter((element: string) => element.includes('@'))
            .map((element: string) => getIdFromMention(element));

        const guild: Guild = this.message.guild!;

        const promises = idList.map((id) => addPlayerAndCharacterIfNotExists(id, guild));
        await Promise.all(promises);

        const players: Array<PlayerCharacter> = (await this.fetchPlayers()).filter((jogador) => {
            return idList.includes(jogador.playerId.toString());
        });

        const results: Array<CharacterRoll> = [];

        for (const player of players) {
            results.push({
                characterName: player.characterName,
                result: this.rollTurn(),
            });
        }

        results.sort((a, b) => b.result - a.result);

        let message: string = '--TURNOS--\n\n';
        for (const result of results) {
            message += `${result.characterName} - ${result.result}\n`;
        }

        this.message.reply(message);
    }
    private async fetchPlayers() {
        const players: Array<PlayerCharacter> = await db
            .select({
                playerId: jogador.discordId,
                characterName: personagem.nome,
            })
            .from(jogador)
            .innerJoin(personagem, eq(jogador.discordId, personagem.jogador))
            .where(eq(personagem.ativo, true));

        return players;
    }

    private rollTurn(): number {
        return Math.floor(Math.random() * 20 + 1);
    }
}
