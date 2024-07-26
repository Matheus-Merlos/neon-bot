import { Message } from 'discord.js';
import { Character } from '../character';
import { Rank, RankFactory } from './rank';

function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

function detectLevelUp(
    target: Character,
    methodName: string,
    descriptor: PropertyDescriptor,
): PropertyDescriptor {
    const originalMethod = descriptor.value;
    return {
        value: async function (...args: Array<unknown>) {
            await originalMethod.apply(this, [...args]);
            if (!isNumber(args[0])) {
                throw new Error('First argument must be a number');
            }
            if (!(args[2] instanceof Message)) {
                throw new Error('Second argument must be a message');
            }
            const character: Character = this as Character;
            const message: Message = args[2];

            const ranks: Array<Rank> = await RankFactory.retrieveAllRanks();

            let rankId = 0;

            for (const rank of ranks) {
                if (character.xp <= rank.necessaryXp) {
                    break;
                }
                rankId++;
            }
            if (character.currentRank < rankId) {
                await character.updateRank(ranks[rankId - 1]);
                message.reply(
                    `O player ${character.playerMention()} acabou de evoluir para **${ranks[rankId - 1].name}** e ganhou **1** slot de habilidade e **2** pontos de atributos, além de poder modificar uma habilidade antiga!`,
                );
            }
        },
    };
}

export { detectLevelUp };
