import axios from 'axios';
import { Attachment, Message, PermissionFlagsBits } from 'discord.js';
import hasPermission from '../../../decorators/has-permission';
import ItemFactory from '../../../factories/item-factory';
import Command from '../../base-command';

export default class CreateItem implements Command {
    @hasPermission(PermissionFlagsBits.ManageChannels)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const img: Attachment | undefined | null = message.attachments.first();

        const priceIndex = messageAsList.findIndex((element) => !isNaN(parseInt(element)) && element.trim() !== '');
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

        let imageStream = null;
        let contentType = null;
        let contentLength = null;
        if (typeof img !== 'undefined' && img.contentType !== null && img.contentType!.includes('image')) {
            let image;
            try {
                image = await axios.get(img.url, { responseType: 'stream' });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    message.reply(`Erro ao fazer o download da imagem: ${error.name}:${error.message}`);
                }
                return;
            }

            imageStream = image.data;
            contentType = img.contentType;
            contentLength = image.headers['content-length'];
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
            createdItem = await ItemFactory.getInstance().create(
                itemName,
                description!,
                imageStream,
                contentType,
                contentLength,
                price,
                durability,
                message.guildId!,
            );
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.toUpperCase().includes('UNIQUE'))
                    message.reply(`Erro: Já existe um item com o nome **${itemName}**.`);
                return;
            }
        }

        message.reply({
            content: `Item **${itemName}** criado com sucesso!`,
            embeds: [ItemFactory.getInstance().show(createdItem!)],
        });
    }
}
