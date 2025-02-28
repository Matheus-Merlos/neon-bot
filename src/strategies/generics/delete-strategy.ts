import { Message } from 'discord.js';
import { Table } from 'drizzle-orm';
import Factory from '../../factories/base-factory';
import addConfirmation from '../../utils/confirmation-row';
import Strategy from '../base-strategy';

export default class DeleteStrategy<T extends Table, U extends Factory<T>> implements Strategy {
    constructor(
        protected readonly factoryInstance: U,
        protected readonly tableName: string,
    ) {}
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const entryName = messageAsList.join(' ');

        let entry;
        try {
            entry = await this.factoryInstance.getByName(entryName, message.guildId!);
        } catch {
            message.reply(`Não existe um ${this.tableName} com o nome **${entryName}**.`);
            return;
        }

        addConfirmation({
            message,
            timeToInteract: 30_000,
            confirmationMsgContent: `Atenção: Isso irá deletar completamente o ${this.tableName} **${entry.name}**, você tem certeza que quer fazer isso?`,
            interactionFilter: (i) => i.user.id === message.author.id,
            actions: {
                callbackFnAccept: async (confirmationMessage: Message) => {
                    await this.factoryInstance.delete(entry.id!);

                    confirmationMessage.edit({
                        content: `${this.tableName} **${entry.name}** deletado com sucesso.`,
                        components: [],
                    });
                    return;
                },

                callbackFnDecline: () => {
                    throw new Error();
                },
            },
        });
    }
}
