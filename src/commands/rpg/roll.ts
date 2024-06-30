import { Message } from 'discord.js';

export default function roll(message: Message) {
    const msgArray: Array<string> = message.content.split(' ');
    if (msgArray.length === 1) {
        const result = rollDice(6);
        message.reply(`:game_die: | Você rolou um 1d6... E conseguiu **${result}**`);
        return;
    }
    if (msgArray.length === 2) {
        const dice: number = parseInt(msgArray[1]);
        if (isNaN(dice)) {
            message.reply(`O valor **${msgArray[1]}** não é um número válido`);
            return;
        }
        const result: number = rollDice(dice);

        message.reply(`:game_die: | Você rolou um 1d${dice}... E conseguiu **${result}**`);
        return;
    }

    const dice: number = parseInt(msgArray[1]);
    if (isNaN(dice)) {
        message.reply(`O valor **${msgArray[1]}** não é um número válido`);
        return;
    }

    const operation: string = msgArray[2][0];
    if (!['+', '-', '*', '/'].includes(operation)) {
        message.reply('Sintaxe do comando errada/Operação não suportada');
        return;
    }
    const result: number = rollDice(dice);

    const modifier: string = msgArray[2].replace(operation, '');

    const expression: string = `${modifier}${msgArray.slice(3).join('')}`;

    let totalResult: number;
    try {
        totalResult = eval(`${result}${operation}${expression}`);
    } catch (error) {
        message.reply(`A operação \`${expression}\` não é uma operação válida`);
        return;
    }

    message.reply(
        `:game_die: | Você rolou um 1d${dice}... E conseguiu **${totalResult!}**!\n:nerd: | **${totalResult!}** > \`${result} ${operation}${expression}\``,
    );
    return;
}

function rollDice(max: number): number {
    return Math.floor(Math.random() * max + 1);
}
