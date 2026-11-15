import { ChatInputCommandInteraction, Message } from 'discord.js';
import { InferInsertModel, Table } from 'drizzle-orm';
import Factory from '../../factories/base-factory';
import { IStrategy } from '../base-strategy';

type Input = {
    name: string;
};

export default class CreateStrategy<T extends Table, U extends Factory<T>>
    implements IStrategy<Input>
{
    constructor(
        private readonly factoryInstance: U,
        private readonly entryname: string,
    ) {}

    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const createdEntry = await this.factoryInstance.create({
            name: input.name,
            guildId: BigInt(replyInstance.guildId!),
        } as InferInsertModel<T>);

        replyInstance.reply(`${this.entryname} **${createdEntry.name}** criada com sucesso.`);
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const input = {
            name: interaction.options.getString('name', true),
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        if (messageAsList.length > 1 || messageAsList.length <= 0) {
            message.reply(`A ${this.entryname} deve ter no máximo uma palavra,`);
            return;
        }

        await this.handleInput({ name: messageAsList[0] }, message);
    }
}
