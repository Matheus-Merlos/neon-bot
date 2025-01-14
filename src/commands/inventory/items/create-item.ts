import axios from 'axios';
import { Attachment, Message } from 'discord.js';
import db from '../../../db/db';
import { item } from '../../../db/schema';
import ImageFactory from '../../../factories/image-factory';
import ItemFactory from '../../../factories/item-factory';
import Command from '../../base-command';

export default class CreateItem implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        let img: Attachment | undefined | null = message.attachments.first();

        let url: string | null = null;

        if (
            typeof img !== 'undefined' &&
            img.contentType !== null &&
            img.contentType!.includes('image')
        ) {
            let image;
            try {
                image = await axios.get(img.url, { responseType: 'stream' });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    message.reply(
                        `Erro ao fazer o download da imagem: ${error.name}:${error.message}`,
                    );
                }
                return;
            }

            try {
                url = await ImageFactory.uploadImage(`${img.name}`, image.data, img.contentType);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    message.reply(
                        `Erro ao fazer o upload da imagem: ${error.name}:${error.message}`,
                    );
                }
                return;
            }
        } else {
            img = null;
        }

        const priceIndex = messageAsList.findIndex(
            (element) => !isNaN(parseInt(element)) && element.trim() !== '',
        );
        let itemName: string;

        if (priceIndex === 1) {
            await message.reply('O nome do item não deve começar com um número');
            return;
        }

        if (priceIndex === 2) {
            itemName = messageAsList[1].replaceAll('"', '');
        } else {
            itemName = message.content.split('"')[1];
        }

        const price = parseInt(messageAsList[priceIndex]);
        const durability = parseInt(messageAsList[priceIndex + 1]);
        let description: string | null = messageAsList
            .slice(priceIndex + 2, messageAsList.length)
            .join(' ')
            .trim();

        description = description === '' ? null : description;

        let createdItem;

        try {
            [createdItem] = await db
                .insert(item)
                .values({
                    name: itemName,
                    description,
                    image: url,
                    price,
                    durability,
                    canBuy: true,
                })
                .returning();
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.toUpperCase().includes('UNIQUE'))
                    message.reply(`Erro: Já existe um item com o nome **${itemName}**.`);
                return;
            }
        }

        message.reply(`Item **${itemName}** criado com sucesso!`);

        ItemFactory.sendItem(message, createdItem!);
    }
}
