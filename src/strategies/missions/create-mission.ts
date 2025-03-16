import axios from 'axios';
import { Message } from 'discord.js';
import MissionDifficultyFactory from '../../factories/missions/mission-difficulty-factory';
import MissionFactory from '../../factories/missions/mission-factory';
import { BucketDirectories, ImageHandler } from '../../utils';
import { EntryNotFoundError } from '../../utils/errors';
import Strategy from '../base-strategy';

export default class CreateMissionStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const difficultyName = messageAsList[0];

        let missionDifficulty;
        try {
            missionDifficulty = await MissionDifficultyFactory.getInstance().getByName(difficultyName, message.guildId!);
        } catch (error) {
            if (error instanceof EntryNotFoundError) {
                message.reply(`Não foi encontrado uma dificuldade de missão com o nome **${difficultyName}**`);
            }
            return;
        }

        messageAsList.splice(0, 1);

        const expIndex = messageAsList.findIndex((element) => !isNaN(parseInt(element)) && element.trim() !== '');

        const missionName = messageAsList.slice(0, expIndex).join(' ').replaceAll('"', '');
        const xp = parseInt(messageAsList[expIndex]);
        const gold = parseInt(messageAsList[expIndex + 1]);
        const description = messageAsList
            .slice(expIndex + 2, messageAsList.length)
            .join(' ')
            .replaceAll('"', '');

        const img = message.attachments.first();
        const isValidImage = img && img.contentType && img.contentType.includes('image');

        let imgUrl = null;
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

            const result = await ImageHandler.getInstance().uploadImage(
                BucketDirectories.MISSIONS_DIR,
                missionName,
                imageStream,
            );

            imgUrl = result.url;
            salt = result.salt;
        }

        const created = await MissionFactory.getInstance().create({
            name: missionName,
            xp,
            gold,
            difficulty: missionDifficulty.id,
            description,
            guildId: BigInt(message.guildId!),
            imageUrl: imgUrl,
            salt: salt,
        });

        await message.reply({
            content: `Missão **${created.name}** criado com sucesso com a dificuldade **${missionDifficulty.name}**:`,
            embeds: [MissionFactory.getInstance().show(created)],
        });
    }
}
