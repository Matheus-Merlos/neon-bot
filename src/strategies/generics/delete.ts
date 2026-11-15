import { ChatInputCommandInteraction, Message } from 'discord.js';
import { InferSelectModel, Table } from 'drizzle-orm';
import { ItemFactory, MissionFactory } from '../../factories';
import Factory from '../../factories/base-factory';
import { BucketDirectories, ImageHandler } from '../../utils';
import addConfirmation from '../../utils/confirmation-row';
import { IStrategy } from '../base-strategy';

type Input = {
    name: string;
};

export default class DeleteStrategy<T extends Table, U extends Factory<T>>
    implements IStrategy<Input>
{
    constructor(
        protected readonly factoryInstance: U,
        protected readonly tableName: string,
    ) {}

    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const entryName = input.name;

        let entry: InferSelectModel<T>;
        try {
            entry = await this.factoryInstance.getByName(entryName, replyInstance.guildId!);
        } catch {
            replyInstance.reply(`Não existe um ${this.tableName} com o nome **${entryName}**.`);
            return;
        }

        const userId = 'author' in replyInstance ? replyInstance.author.id : replyInstance.user.id;

        addConfirmation({
            replyInstance,
            timeToInteract: 30_000,
            confirmationMsgContent: `Atenção: Isso irá deletar completamente o ${this.tableName} **${entry.name}**, você tem certeza que quer fazer isso?`,
            interactionFilter: (i) => i.user.id === userId,
            actions: {
                callbackFnAccept: async (confirmationMessage: Message) => {
                    //Deletes the image from the bucket (if existis a image)
                    if (Object.keys(entry).includes('salt') && entry.salt! !== null) {
                        let directory;
                        if (
                            this.factoryInstance instanceof
                            Object.getPrototypeOf(ItemFactory).constructor
                        ) {
                            directory = BucketDirectories.ITEMS_DIR;
                        }
                        if (
                            this.factoryInstance instanceof
                            Object.getPrototypeOf(MissionFactory).constructor
                        ) {
                            directory = BucketDirectories.MISSIONS_DIR;
                        }

                        if (directory === undefined) {
                            throw new Error('Could not delete image');
                        }

                        await ImageHandler.deleteImage(directory, entry.salt!, entry.name!);
                    }
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

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            name: o.getString('name', true),
        };

        return await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const entryName = messageAsList.join(' ');

        return await this.handleInput({ name: entryName }, message);
    }
}
