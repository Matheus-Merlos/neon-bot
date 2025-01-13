import axios from 'axios';
import { Colors, EmbedBuilder, Message } from 'discord.js';
import db from '../../../db/db';
import { item } from '../../../db/schema';
import ImageFactory from '../../../factories/image-factory';
import Command from '../../base-command';

export default class CreateItem implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const img = message.attachments.first();

        let url: string | null = null;

        if (typeof img !== 'undefined') {
            const image = await axios.get(img!.url, { responseType: 'stream' });

            url = await ImageFactory.uploadImage(
                `items/${img!.name}`,
                image.data,
                img!.contentType!,
            );
        }

        const priceIndex = messageAsList.findIndex(
            (element) => !isNaN(parseInt(element)) && element.trim() !== '',
        );
        let itemName: string;

        if (priceIndex === 2) {
            itemName = messageAsList[1].replaceAll('"', '');
        } else {
            itemName = message.content.split('"')[1];
        }

        const price = parseInt(messageAsList[priceIndex]);
        const durability = parseInt(messageAsList[priceIndex + 1]);
        const description = messageAsList.slice(priceIndex + 2, messageAsList.length).join(' ');

        const [createdItem] = await db
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

        const itemEmbed = new EmbedBuilder()
            .setColor(Colors.Aqua)
            .setTitle(itemName)
            .setImage(url)
            .setFields(
                {
                    name: 'Nome',
                    value: itemName,
                    inline: true,
                },
                {
                    name: 'Preço',
                    value: `$${price}`,
                    inline: true,
                },
                {
                    name: 'Descrição',
                    value: description,
                    inline: false,
                },
                {
                    name: 'Comprável?',
                    value: createdItem.canBuy === true ? 'Sim' : 'Não',
                    inline: true,
                },
            );

        message.reply({ embeds: [itemEmbed], content: `Item **${itemName}** criado com sucesso!` });
    }
}
