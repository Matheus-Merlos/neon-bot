import axios from 'axios';
import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { character } from '../../db/schema';
import { getCharacter } from '../../utils';
import ImageHandler, { BucketDirectories } from '../../utils/image-handler';
import Strategy from '../base-strategy';

export default class EditImageStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const img = message.attachments.first();

        const isValidImage = img && img.contentType && img.contentType.includes('image');

        if (!isValidImage) {
            message.reply('Erro: Você não anexou uma imagem válida.');
            return;
        }

        const char = await getCharacter(message, messageAsList);

        await ImageHandler.getInstance().deleteImage(BucketDirectories.CHARACTERS_DIR, char.salt!, char.name);

        const imageDownload = await axios.get(img.url, { responseType: 'stream' });

        const { url, salt } = await ImageHandler.getInstance().uploadImage(
            BucketDirectories.CHARACTERS_DIR,
            char.name,
            imageDownload.data,
        );

        await db.update(character).set({ imageUrl: url, salt }).where(eq(character.id, char.id));

        message.reply('Imagem editada com sucesso!');
    }
}
