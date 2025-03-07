import { Message } from 'discord.js';
import MissionDifficultyFactory from '../../factories/missions/mission-difficulty-factory';
import Strategy from '../base-strategy';

export default class CreateMissionDifficultyStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        if (messageAsList.length > 1) {
            message.reply('O nome da dificuldade não pode ter mais que uma palavra.');
            return;
        }

        const difficultyName = messageAsList[0];
        const diff = await MissionDifficultyFactory.getInstance().create({
            name: difficultyName,
            guildId: BigInt(message.guildId),
        });

        await message.reply(`Dificuldade de missão **${diff.name}** criada com sucesso!`);
    }
}
