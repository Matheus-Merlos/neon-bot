import { Message } from 'discord.js';
import { Command } from '.';
import anthropic from '../integrations/anthropic';
import { replyInChunks, withTyping } from '../utils/discord-reply';

export default class Question implements Command {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);

        const question = messageAsList.join(' ').trim();

        if (!question) {
            await message.reply(
                'Escreva sua dúvida depois do comando. Ex.: `!duvida como funciona o teste de esquiva?`',
            );
            return;
        }

        try {
            const answer = await withTyping(message, anthropic.systemQuestion(question, message));
            await replyInChunks(message, answer);
        } catch (err) {
            console.error('[Question]', err);
            await message.reply('Deu um erro ao consultar as regras. Tente de novo em instantes.');
        }
    }
}
