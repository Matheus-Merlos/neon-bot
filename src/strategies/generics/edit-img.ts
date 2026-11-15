/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { Attachment, ChatInputCommandInteraction, Message } from 'discord.js';
import { Column, eq, InferSelectModel, Table } from 'drizzle-orm';
import db from '../../db/db';
import { CharacterFactory, ItemFactory, MissionFactory } from '../../factories';
import Factory from '../../factories/base-factory';
import ImageHandler, { BucketDirectories } from '../../utils/image-handler';
import { IStrategy } from '../base-strategy';

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

type Input = {
    entryName: string;
    image: Attachment;
};

export default class EditImageStrategy<
    T extends Table,
    U extends Factory<T>,
    V extends T & TableImageFields,
> implements IStrategy<Input>
{
    constructor(
        private readonly factoryInstance: U,
        private readonly table: V,
    ) {}

    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const { entryName, image } = input;

        const isValidImage = image.contentType && image.contentType.includes('image');

        if (!isValidImage) {
            replyInstance.reply('Erro: Você não anexou uma imagem válida.');
            return;
        }

        let entry: InferSelectModel<V> | characterSelectModel;
        if (this.factoryInstance instanceof Object.getPrototypeOf(CharacterFactory).constructor) {
            const playerId =
                'author' in replyInstance ? replyInstance.author.id : replyInstance.user.id;
            entry = await CharacterFactory.getFromPlayerId(playerId, replyInstance.guildId!);
        } else {
            entry = await this.factoryInstance.getByName(entryName, replyInstance.guildId!);
        }

        let bucketDirectory = BucketDirectories.MISC_DIR;
        if (this.factoryInstance instanceof Object.getPrototypeOf(CharacterFactory).constructor)
            bucketDirectory = BucketDirectories.CHARACTERS_DIR;
        if (this.factoryInstance instanceof Object.getPrototypeOf(ItemFactory).constructor)
            bucketDirectory = BucketDirectories.ITEMS_DIR;
        if (this.factoryInstance instanceof Object.getPrototypeOf(MissionFactory).constructor)
            bucketDirectory = BucketDirectories.MISSIONS_DIR;

        if (entry.salt !== null && entry.name !== null)
            await ImageHandler.deleteImage(bucketDirectory, entry.salt, entry.name);

        const imageDownload = await axios.get(image.url, { responseType: 'stream' });

        const { url, salt } = await ImageHandler.uploadImage(
            bucketDirectory,
            entry.name!,
            imageDownload.data,
        );

        await db.update(this.table).set({ imageUrl: url, salt }).where(eq(this.table.id, entry.id));

        replyInstance.reply('Imagem editada com sucesso!');
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const image = o.getAttachment('image', true);

        const input = {
            entryName: o.getString('item', true),
            image,
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const img = message.attachments.first();

        if (!img) {
            message.reply('Erro: Você não anexou uma imagem.');
            return;
        }

        await this.handleInput({ entryName: messageAsList.join(' '), image: img }, message);
    }
}
