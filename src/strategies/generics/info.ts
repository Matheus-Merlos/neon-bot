import { ChatInputCommandInteraction, Message } from 'discord.js';
import { Table } from 'drizzle-orm';
import Factory from '../../factories/base-factory';
import ShowEmbed from '../../factories/show-embed';
import Strategy, { IStrategy } from '../base-strategy';

type Input = {
    name: string;
};

export default class InfoStrategy<T extends Table, U extends Factory<T> & ShowEmbed<T>>
    implements IStrategy<Input>
{
    constructor(protected readonly factoryInstance: U) {}

    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const entry = await this.factoryInstance.getByName(input.name, replyInstance.guildId!);

        replyInstance.reply({ embeds: [this.factoryInstance.show(entry)] });
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            name: o.getString('name', true),
        };

        return await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const entryName = messageAsList.join(' ');
        await this.handleInput({ name: entryName }, message);
    }
}
