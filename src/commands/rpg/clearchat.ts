import { Collection, Message } from 'discord.js';
import Command from '../command';

export default class ClearChat extends Command {
    public async execute(): Promise<void> {
        const messages: Collection<
            string,
            Message<boolean>
        > = await this.message.channel.messages.fetch({ limit: 100 });

        const deletePromises: Promise<unknown>[] = [];
        let total: number = 0;

        const messagesToDelete: Collection<string, Message<boolean>> = messages.filter(
            (message: Message) => message.content.includes('//') || message.content.includes('(('),
        );

        messagesToDelete.forEach((message) => {
            deletePromises.push(message.delete());
            total++;
        });

        await Promise.all(deletePromises);

        await this.message.channel.send(`**${total}** mensagens foram excluídas com sucesso.`);
    }
}
