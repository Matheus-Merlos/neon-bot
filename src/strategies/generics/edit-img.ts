/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { Message } from 'discord.js';
import { Column, eq, InferSelectModel, Table } from 'drizzle-orm';
import db from '../../db/db';
import { CharacterFactory, ItemFactory, MissionFactory } from '../../factories';
import Factory from '../../factories/base-factory';
import { getCharacter } from '../../utils';
import ImageHandler, { BucketDirectories } from '../../utils/image-handler';
import Strategy from '../base-strategy';

type TableImageFields = {
    id: Column<any>;
    name: Column<any>;
    image?: Column<any>;
    salt?: Column<any>;
};

type characterSelectModel = {
    id: number;
    name: string;
    xp: number;
    gold: number;
    player: bigint;
    imageUrl: string | null;
    salt: string | null;
    guildId: bigint;
    characterClass: number | null;
};

export default class EditImageStrategy<T extends Table, U extends Factory<T>, V extends T & TableImageFields>
    implements Strategy
{
    constructor(
        private readonly factoryInstance: U,
        private readonly table: V,
    ) {}

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const img = message.attachments.first();
        const isValidImage = img && img.contentType && img.contentType.includes('image');

        if (!isValidImage) {
            message.reply('Erro: Você não anexou uma imagem válida.');
            return;
        }

        let entry: InferSelectModel<V> | characterSelectModel;
        if (this.factoryInstance instanceof CharacterFactory) {
            entry = await getCharacter(message, messageAsList);
        } else {
            entry = await this.factoryInstance.getByName(messageAsList.join(' '), message.guildId);
        }

        let bucketDirectory = BucketDirectories.MISC_DIR;
        if (this.factoryInstance instanceof CharacterFactory) bucketDirectory = BucketDirectories.CHARACTERS_DIR;
        if (this.factoryInstance instanceof ItemFactory) bucketDirectory = BucketDirectories.ITEMS_DIR;
        if (this.factoryInstance instanceof MissionFactory) bucketDirectory = BucketDirectories.MISSIONS_DIR;

        if (entry.salt !== null && entry.name !== null)
            await ImageHandler.getInstance().deleteImage(bucketDirectory, entry.salt, entry.name);

        const imageDownload = await axios.get(img.url, { responseType: 'stream' });

        const { url, salt } = await ImageHandler.getInstance().uploadImage(bucketDirectory, entry.name!, imageDownload.data);

        await db.update(this.table).set({ imageUrl: url, salt }).where(eq(this.table.id, entry.id));

        message.reply('Imagem editada com sucesso!');
    }
}
