import { Message } from 'discord.js';
import { InferInsertModel, Table } from 'drizzle-orm';
import Factory from '../../factories/base-factory';
import Strategy from '../base-strategy';

export default class CreateStrategy<T extends Table, U extends Factory<T>> implements Strategy {
    constructor(
        private readonly factoryInstance: U,
        private readonly entryname: string,
    ) {}
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        if (messageAsList.length > 1 || messageAsList.length <= 0) {
            message.reply(`A ${this.entryname} deve ter no máximo uma palavra,`);
            return;
        }

        const entryName = messageAsList[0];

        const createdEntry = await this.factoryInstance.create({
            name: entryName,
            guildId: BigInt(message.guildId),
        } as InferInsertModel<T>);

        message.reply(`${this.entryname} **${createdEntry.name}** criada com sucesso.`);
    }
}
