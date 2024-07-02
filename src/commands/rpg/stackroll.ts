import { getIdFromMention } from '../../utils';
import { jogador, personagem } from '../../models/schema';
import db from '../../models/db';
import Command from '../command';
import { eq } from 'drizzle-orm';
import { Guild, GuildMember } from 'discord.js';

export default class StackRoll extends Command {
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');

        const idList: Array<string> = msgArray
            .filter((element: string) => element.includes('@'))
            .map((element: string) => getIdFromMention(element));

        let jogadores = await db
            .select({
                playerId: jogador.discordId,
                characterName: personagem.nome,
            })
            .from(jogador)
            .innerJoin(personagem, eq(jogador.discordId, personagem.jogador))
            .where(eq(personagem.ativo, true));

        let selectedPlayers = jogadores.filter((jogador) => {
            return idList.includes(jogador.playerId.toString());
        });

        for (const id of idList) {
            const playerExists = selectedPlayers.find(
                (jogador) => jogador.playerId.toString() === id,
            );
            if (playerExists) {
                console.log(playerExists);
                continue;
            }
            const guild: Guild = this.message.guild!;
            const member: GuildMember = await guild.members.fetch(id);

            let nicknameArray: Array<string> | undefined = member.nickname?.split(' ');

            if (!nicknameArray) {
                nicknameArray = member.displayName.split(' ');
            }

            const characterName: string = nicknameArray[0].replace(',', '');

            await db.insert(jogador).values({ discordId: BigInt(id) });
            await db.insert(personagem).values({
                nome: characterName,
                xp: 0,
                gold: 0,
                jogador: BigInt(id),
                ativo: true,
            });

            jogadores = await db
                .select({
                    playerId: jogador.discordId,
                    characterName: personagem.nome,
                })
                .from(jogador)
                .innerJoin(personagem, eq(jogador.discordId, personagem.jogador))
                .where(eq(personagem.ativo, true));

            selectedPlayers = jogadores.filter((jogador) => {
                idList.includes(jogador.playerId.toString());
            });
        }

        type CharacterRoll = {
            characterName: string;
            result: number;
        };

        const results: Array<CharacterRoll> = [];

        for (const player of selectedPlayers) {
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

    private rollTurn(): number {
        return Math.floor(Math.random() * 20 + 1);
    }
}
