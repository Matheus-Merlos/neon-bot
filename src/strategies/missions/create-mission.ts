import { Message } from 'discord.js';
import MissionDifficultyFactory from '../../factories/missions/mission-difficulty-factory';
import MissionFactory from '../../factories/missions/mission-factory';
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

        const imageUrl = message.attachments.first();

        const created = await MissionFactory.getInstance().create({
            name: missionName,
            xp,
            gold,
            difficulty: missionDifficulty.id,
            description,
            guildId: BigInt(message.guildId!),
            imageUrl: typeof imageUrl === 'undefined' ? null : imageUrl.url,
        });

        message.reply({
            content: `Missão **${created.name}** criado com sucesso com a dificuldade **${missionDifficulty.name}**:`,
            embeds: [MissionFactory.getInstance().show(created)],
        });
        return;
    }
}
