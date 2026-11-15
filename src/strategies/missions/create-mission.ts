import axios from 'axios';
import { Attachment, ChatInputCommandInteraction, Message } from 'discord.js';
import MissionDifficultyFactory from '../../factories/missions/mission-difficulty-factory';
import MissionFactory from '../../factories/missions/mission-factory';
import { BucketDirectories, ImageHandler } from '../../utils';
import { EntryNotFoundError } from '../../utils/errors';
import { IStrategy } from '../base-strategy';

type Input = {
    difficultyName: string;
    name: string;
    xp: number;
    gold: number;
    description: string;
    image: Attachment | null;
};

export default class CreateMissionStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        let missionDifficulty;
        try {
            missionDifficulty = await MissionDifficultyFactory.getByName(
                input.difficultyName,
                replyInstance.guildId!,
            );
        } catch (error) {
            if (error instanceof EntryNotFoundError) {
                replyInstance.reply(
                    `Não foi encontrado uma dificuldade de missão com o nome **${input.difficultyName}**`,
                );
            }
            return;
        }

        const isValidImage =
            input.image && input.image.contentType && input.image.contentType.includes('image');

        let imgUrl = null;
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
                BucketDirectories.MISSIONS_DIR,
                input.name,
                imageStream,
            );

            imgUrl = result.url;
            salt = result.salt;
        }

        const created = await MissionFactory.create({
            name: input.name,
            xp: input.xp,
            gold: input.gold,
            difficulty: missionDifficulty.id,
            description: input.description,
            guildId: BigInt(replyInstance.guildId!),
            imageUrl: imgUrl,
            salt: salt,
        });

        await replyInstance.reply({
            content: `Missão **${created.name}** criada com sucesso com a dificuldade **${missionDifficulty.name}**:`,
            embeds: [MissionFactory.show(created)],
        });
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            difficultyName: o.getString('difficulty', true),
            name: o.getString('name', true),
            xp: o.getNumber('xp', true),
            gold: o.getNumber('gold', true),
            description: o.getString('description') ?? '',
            image: o.getAttachment('image') ?? null,
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const difficultyName = messageAsList[0];
        messageAsList.splice(0, 1);

        const expIndex = messageAsList.findIndex(
            (element) => !isNaN(parseInt(element)) && element.trim() !== '',
        );

        const name = messageAsList.slice(0, expIndex).join(' ').replaceAll('"', '');
        const xp = parseInt(messageAsList[expIndex]);
        const gold = parseInt(messageAsList[expIndex + 1]);
        const description = messageAsList
            .slice(expIndex + 2, messageAsList.length)
            .join(' ')
            .replaceAll('"', '');

        const img = message.attachments.first();

        await this.handleInput(
            {
                difficultyName,
                name,
                xp,
                gold,
                description,
                image: img ?? null,
            },
            message,
        );
    }
}
