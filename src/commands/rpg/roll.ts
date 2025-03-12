import { Message } from 'discord.js';
import Command from '../base-command';

export default class Roll implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        if (messageAsList.length === 0) {
            message.reply(`Você rolou um \`1d6\` e conseguiu **${this.simpleRoll()}**`);
            return;
        }
        if (messageAsList.length === 1) {
            const results = this.roll(messageAsList[0]);

            message.reply(`Você rolou um \`${results.results.length}d${results.dice}\` e conseguiu ${results.results}.`);
        }
    }

    private roll(rollText: string): { results: Array<number>; dice: number } {
        let quantity = 1;
        let dice;
        if (rollText.includes('d')) {
            [quantity, dice] = rollText.split('d').map((entry) => parseInt(entry));
        } else {
            dice = parseInt(rollText);
        }

        const rolls = [];
        for (let i = 0; i < quantity; i++) {
            rolls.push(Math.floor(Math.random() * dice) + 1);
        }

        return {
            results: rolls,
            dice,
        };
    }
    private simpleRoll(): number {
        return Math.floor(Math.random() * 6) + 1;
    }
}
