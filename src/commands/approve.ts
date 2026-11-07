import { Message } from 'discord.js';
import { Command } from '.';
import anthropic from '../integrations/anthropic';
import { replyInChunks, withTyping } from '../utils/discord-reply';

export default class Approval implements Command {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        if (!message.reference) {
            message.reply('Mencione a mensagem com a(s) habilidade(s) a ser(em) aprovada(s).');
            return;
        }

        const skill = (await message.fetchReference()).content;

        try {
            const response = await withTyping(
                message,
                anthropic.skillApproval(skill, await message.fetchReference()),
            );

            await replyInChunks(message, response);
        } catch (err) {
            console.error('[SkillApproval]', err);
            await message.reply('Deu um erro ao avaliar a habilidade. Tente de novo em instantes.');
        }
    }
}
