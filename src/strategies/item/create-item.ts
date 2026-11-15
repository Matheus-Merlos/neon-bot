import axios from 'axios';
import { Attachment, ChatInputCommandInteraction, EmbedBuilder, Message } from 'discord.js';
import ItemFactory from '../../factories/item-factory';
import { BucketDirectories, ImageHandler } from '../../utils';
import Strategy, { IStrategy } from '../base-strategy';

type CreateItemInput = {
    name: string;
    durability: number;
    buyable: boolean;
    price: number;
    description: string | null;
    image: Attachment | null;
    guildId: string;
};

export default class CreateItemStrategy implements IStrategy<CreateItemInput> {
    async handleInput(
        input: CreateItemInput,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        let createdItem;

        try {
            const isValidImage =
                input.image && input.image.contentType && input.image.contentType.includes('image');

            let url = null;
            let salt = null;

            if (isValidImage) {
                let image;
                try {
                    image = await axios.get(input.image!.url, { responseType: 'stream' });
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        replyInstance.reply(
                            `Erro ao fazer o download da imagem: ${error.name}:${error.message}`,
                        );
                    }
                    return;
                }

                const imageStream = image.data;

                const result = await ImageHandler.uploadImage(
                    BucketDirectories.ITEMS_DIR,
                    input.name,
                    imageStream,
                    false,
                );

                url = result.url;
                salt = result.salt;
            }
            createdItem = await ItemFactory.create({
                name: input.name,
                description: input.description,
                price: input.price,
                durability: input.durability,
                guildId: BigInt(replyInstance.guildId!),
                canBuy: input.buyable,
                salt,
                image: url,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.toUpperCase().includes('UNIQUE'))
                    replyInstance.reply(
                        `Erro: Já existe um item com o nome **${input.name}** neste servidor.`,
                    );
                return;
            }
        }
        replyInstance.reply({
            content: `Item **${input.name}** criado com sucesso!`,
            embeds: [ItemFactory.show(createdItem!)],
        });
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const priceIndex = messageAsList.findIndex(
            (element) => !isNaN(parseInt(element)) && element.trim() !== '',
        );

        if (priceIndex === 0) {
            await message.reply('O nome do item não deve começar com um número');
            return;
        }

        const itemName = messageAsList.slice(0, priceIndex).join(' ').replaceAll('"', '');

        const price = parseInt(messageAsList[priceIndex]);
        const durability = parseInt(messageAsList[priceIndex + 1]);
        const description: string | null = messageAsList
            .slice(priceIndex + 2, messageAsList.length)
            .join(' ')
            .trim();
        const image = message.attachments.first();

        await this.handleInput(
            {
                name: itemName,
                durability,
                description,
                price,
                guildId: message.guildId!,
                image: image ?? null,
                buyable: true,
            },
            message,
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const item = {
            name: o.getString('name', true),
            durability: o.getNumber('durability') ?? 1,
            buyable: o.getBoolean('buyable') ?? false,
            price: o.getNumber('price') ?? 0,
            description: o.getString('description') ?? null,
            image: o.getAttachment('image') ?? null,
            guildId: interaction.guildId!,
        };

        await this.handleInput(item, interaction);
    }
}
