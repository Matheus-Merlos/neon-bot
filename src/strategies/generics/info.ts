import { Message } from 'discord.js';
import { Table } from 'drizzle-orm';
import Factory from '../../factories/base-factory';
import ShowEmbed from '../../factories/show-embed';
import Strategy from '../base-strategy';

export default class InfoStrategy<T extends Table, U extends Factory<T> & ShowEmbed<T>> implements Strategy {
    constructor(protected readonly factoryInstance: U) {}
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const entryName = messageAsList.join(' ');
        const entry = await this.factoryInstance.getByName(entryName, message.guildId);

        message.reply({ embeds: [this.factoryInstance.show(entry)] });
    }
}
