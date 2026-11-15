import { ChatInputCommandInteraction, Message } from 'discord.js';

export async function safeDeferReply(
    replyInstance: ChatInputCommandInteraction | Message<true>,
): Promise<void> {
    if (!('author' in replyInstance) && !replyInstance.deferred && !replyInstance.replied) {
        await replyInstance.deferReply();
    }
}
