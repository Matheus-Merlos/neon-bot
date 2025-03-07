import { DiscordAPIError, Message, TextChannel } from 'discord.js';
import Command from '../base-command';

export default class ClearChat implements Command {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const messages = await message.channel.messages.fetch({ limit: 100 });
        const messagesToDelete = messages.filter(
            (message) =>
                message.content.startsWith('//') ||
                message.content.startsWith('((') ||
                message.content.startsWith('||') ||
                message.content.endsWith('//') ||
                message.content.endsWith('((') ||
                message.content.includes('gif'),
        );

        try {
            await (message.channel as TextChannel).bulkDelete(messagesToDelete);
        } catch (e) {
            if (e instanceof DiscordAPIError) {
                // pass
            }
        }

        await message.reply(`**${messagesToDelete.size}** mensagens foram deletadas com sucesso.`);
    }
}
