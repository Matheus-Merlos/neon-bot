import { Message } from 'discord.js';
import CharacterFactory from '../../factories/character-factory';
import getIdFromMention from '../../utils/get-id-from-mention';
import Command from '../base-command';

export default class TurnList implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const guildId = message.guildId!;

        const foes: Array<string> = messageAsList.filter((entry) => !entry.includes('@'));
        const players = messageAsList.filter((entry) => entry.includes('@'));

        const charNames: Array<string> = [];
        for (const player of players) {
            const char = await CharacterFactory.getInstance().getFromPlayerId(getIdFromMention(player), guildId);
            charNames.push(char.name);
        }

        const turns: Array<{ name: string; result: number; isFoe: boolean }> = [];

        foes.forEach((foe) => {
            turns.push({
                name: foe,
                result: Math.floor(Math.random() * 20) + 1,
                isFoe: true,
            });
        });

        charNames.forEach((char) => {
            turns.push({
                name: char,
                result: Math.floor(Math.random() * 20) + 1,
                isFoe: false,
            });
        });

        turns.sort((a, b) => b.result - a.result);

        let msg = '```\n---TURNOS---\n\n';

        turns.forEach((turn) => {
            turn.name = turn.isFoe ? `**${turn.name}**` : turn.name;
            msg += `${turn.name} - ${turn.result}\n`;
        });

        msg += '```';

        message.reply(msg);
    }
}
