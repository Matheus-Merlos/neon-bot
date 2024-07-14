import { Collection, Message, PermissionsBitField } from 'discord.js';
import { Command } from '../command';
import { hasPermission } from '../decorators';

export default class ClearChat implements Command {
    @hasPermission(PermissionsBitField.Flags.ManageMessages)
    public async execute(message: Message): Promise<void> {
        const messages: Collection<string, Message<boolean>> = await message.channel.messages.fetch(
            { limit: 100 },
        );

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

        await message.channel.send(`**${total}** mensagens foram excluídas com sucesso.`);
    }
}
