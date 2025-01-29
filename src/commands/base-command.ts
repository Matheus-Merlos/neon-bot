/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message } from 'discord.js';
import Factory from '../factories/base-factory';
import ShowEmbed from '../factories/show-embed';

export default interface Command {
    execute(message: Message, messageAsList: Array<string>): Promise<void>;
}

export abstract class InfoCommand<T extends Factory<any> & ShowEmbed<any>> implements Command {
    constructor(
        protected readonly factoryInstance: T,
        protected readonly entryName: string,
        protected readonly isFeminineWord: boolean = false,
    ) {}

    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
        const entryName = messageAsList.join(' ').trim();

        let entry;

        try {
            entry = await this.factoryInstance.getByName(entryName, message.guildId!);
        } catch {
            await message.reply(
                `Não foi encontrado ${this.isFeminineWord ? 'uma' : 'um'} ${this.entryName} com o nome **${entryName}**.`,
            );
            return;
        }

        await message.reply({ embeds: [this.factoryInstance.show(entry)] });
    }
}
