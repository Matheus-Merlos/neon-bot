import axios from 'axios';
import { Message } from 'discord.js';
import ImageFactory from '../../../factories/image-factory';
import Command from '../../base-command';

export default class CreateItem implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const img = message.attachments.first();

        const image = await axios.get(img!.url, { responseType: 'stream' });

        const url = await ImageFactory.uploadImage(
            `items/${img!.name}`,
            image.data,
            img!.contentType!,
        );

        message.reply(url);
    }
}
