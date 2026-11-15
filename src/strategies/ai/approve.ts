import { ChatInputCommandInteraction, Message } from 'discord.js';
import anthropic from '../../integrations/anthropic';
import { replyInChunks, withTyping } from '../../utils/discord-reply';
import { IStrategy } from '../base-strategy';

type Input = {
    skill: string;
    referenceMessage: Message<true>;
};

export default class ApproveStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        try {
            const response = await withTyping(
                replyInstance,
                anthropic.skillApproval(input.skill, input.referenceMessage),
            );

            await replyInChunks(replyInstance, response);
        } catch (err) {
            console.error('[SkillApproval]', err);
            await replyInstance.reply(
                'Deu um erro ao avaliar a habilidade. Tente de novo em instantes.',
            );
        }
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const messageId = interaction.options.getString('message_id', true);

        let referenceMessage: Message<true>;
        try {
            const msg = await interaction.channel!.messages.fetch(messageId);
            if (!msg.inGuild()) {
                await interaction.reply('A mensagem precisa ser de um servidor.');
                return;
            }
            referenceMessage = msg;
        } catch {
            await interaction.reply('Não foi possível encontrar a mensagem com esse ID.');
            return;
        }

        await this.handleInput({ skill: referenceMessage.content, referenceMessage }, interaction);
    }

    async execute(message: Message<true>): Promise<void> {
        if (!message.reference) {
            message.reply('Mencione a mensagem com a(s) habilidade(s) a ser(em) aprovada(s).');
            return;
        }

        const referenceMessage = await message.fetchReference();
        if (!referenceMessage.inGuild()) {
            message.reply('A mensagem precisa ser de um servidor.');
            return;
        }

        await this.handleInput({ skill: referenceMessage.content, referenceMessage }, message);
    }
}
