import { Message } from 'discord.js';
import Command from '../base-command';

export default class Calculate implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const formula = messageAsList.join(' ');

        let result;
        try {
            result = eval(formula);
        } catch {
            await message.reply(`Erro: A fórmula \`${formula}\` não é uma fórmula válida.`);
            return;
        }
        await message.reply(`O resultado de \`${formula}\` é **${result}**`);
    }
}
