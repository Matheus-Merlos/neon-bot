import { ChatInputCommandInteraction, Message, PermissionFlagsBits } from 'discord.js';
import anthropic from '../../integrations/anthropic';
import { replyInChunks, withTyping } from '../../utils/discord-reply';
import { IStrategy } from '../base-strategy';

type Input = {
    question: string;
};

export default class QuestionStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        if (!input.question) {
            await replyInstance.reply(
                'Escreva sua dúvida depois do comando. Ex.: `!duvida como funciona o teste de esquiva?`',
            );
            return;
        }

        try {
            const isStaff =
                'author' in replyInstance
                    ? (replyInstance.member?.permissions.has(PermissionFlagsBits.ManageGuild) ??
                      false)
                    : (replyInstance.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ??
                      false);

            const displayName =
                'author' in replyInstance
                    ? (replyInstance.member?.displayName ?? replyInstance.author.username)
                    : ((replyInstance.member as { displayName?: string } | null)?.displayName ??
                      replyInstance.user.username);

            const guildName =
                'author' in replyInstance
                    ? replyInstance.guild.name
                    : (replyInstance.guild?.name ?? 'Servidor');

            const answer = await withTyping(
                replyInstance,
                anthropic.systemQuestionFromData({
                    question: input.question,
                    isStaff,
                    displayName,
                    guildName,
                    guildId: replyInstance.guildId!,
                }),
            );
            await replyInChunks(replyInstance, answer);
        } catch (err) {
            console.error('[Question]', err);
            await replyInstance.reply(
                'Deu um erro ao consultar as regras. Tente de novo em instantes.',
            );
        }
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const question = interaction.options.getString('question', true);
        await this.handleInput({ question }, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
        const question = messageAsList.join(' ').trim();
        await this.handleInput({ question }, message);
    }
}
