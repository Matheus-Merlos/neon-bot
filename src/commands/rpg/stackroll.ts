import { addPlayerAndCharacterIfNotExists, getIdFromMention } from '../../utils';
import { jogador, personagem } from '../../models/schema';
import db from '../../models/db';
import { Command } from '../command';
import { eq } from 'drizzle-orm';
import { Guild, Message } from 'discord.js';

type PlayerCharacter = {
    playerId: bigint;
    characterName: string;
};

type CharacterRoll = {
    characterName: string;
    result: number;
    isFoe: boolean;
};

export default class StackRoll implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray: Array<string> = message.content.split(' ');

        const idList: Array<string> = msgArray
            .filter((element: string) => element.includes('@'))
            .map((element: string) => getIdFromMention(element));

        const foeList: Array<string> = msgArray
            .slice(1)
            .filter((element: string) => !element.includes('@') && element !== '');

        const guild: Guild = message.guild!;

        const promises = idList.map((id) => addPlayerAndCharacterIfNotExists(id, guild));
        await Promise.all(promises);

        const players: Array<PlayerCharacter> = (await this.fetchPlayers()).filter((jogador) => {
            return idList.includes(jogador.playerId.toString());
        });

        const results: Array<CharacterRoll> = [];

        const combinedList = [...players, ...foeList];

        combinedList.forEach((character) => {
            results.push({
                characterName: typeof character === 'string' ? character : character.characterName,
                result: this.rollTurn(),
                isFoe: typeof character === 'string', //Foe = String,
            });
        });

        results.sort((a, b) => b.result - a.result);

        let msg: string = '--TURNOS--\n\n';
        for (const result of results) {
            if (result.isFoe) {
                msg += `**${result.characterName} - ${result.result}**\n`;
                continue;
            }
            msg += `${result.characterName.split(' ')[0]} - ${result.result}\n`;
        }

        message.reply(msg);
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
