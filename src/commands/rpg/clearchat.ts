import Command from '../command';

export default class ClearChat extends Command {
    public async execute(): Promise<void> {
        const messages = await this.message.channel.messages.fetch({ limit: 100 });

        const deletePromises: Promise<unknown>[] = [];
        let total: number = 0;

        messages.forEach((message) => {
            if (message.content.includes('//') || message.content.includes('((')) {
                deletePromises.push(message.delete());
                total++;
            }
        });

        await Promise.all(deletePromises);

        await this.message.channel.send(`**${total}** mensagens foram excluídas com sucesso.`);
    }
}
