import axios from 'axios';
import { Message } from 'discord.js';
import ItemFactory from '../../factories/item-factory';
import { BucketDirectories, ImageHandler } from '../../utils';
import Strategy from '../base-strategy';

export default class CreateItemStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const priceIndex = messageAsList.findIndex((element) => !isNaN(parseInt(element)) && element.trim() !== '');

        if (priceIndex === 1) {
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

        let createdItem;

        try {
            const img = message.attachments.first();
            const isValidImage = img && img.contentType && img.contentType.includes('image');

            let url = null;
            let salt = null;

            if (isValidImage) {
                let image;
                try {
                    image = await axios.get(img.url, { responseType: 'stream' });
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        message.reply(`Erro ao fazer o download da imagem: ${error.name}:${error.message}`);
                    }
                    return;
                }

                const imageStream = image.data;

                const result = await ImageHandler.uploadImage(BucketDirectories.ITEMS_DIR, itemName, imageStream, false);

                url = result.url;
                salt = result.salt;
            }
            createdItem = await ItemFactory.create({
                name: itemName,
                description,
                price,
                durability,
                guildId: BigInt(message.guildId!),
                canBuy: true,
                salt,
                image: url,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.toUpperCase().includes('UNIQUE'))
                    message.reply(`Erro: Já existe um item com o nome **${itemName}** neste servidor.`);
                return;
            }
        }

        message.reply({
            content: `Item **${itemName}** criado com sucesso!`,
            embeds: [ItemFactory.show(createdItem!)],
        });
    }
}
