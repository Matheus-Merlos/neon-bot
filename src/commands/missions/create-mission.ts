import { Message, PermissionFlagsBits } from 'discord.js';
import hasPermission from '../../decorators/has-permission';
import ClassObjectiveFactory from '../../factories/class-objectives/class-objective-factory';
import MissionDifficultyFactory from '../../factories/missions/mission-difficulty-factory';
import Command from '../base-command';

export default class CreateMission implements Command {
    @hasPermission(PermissionFlagsBits.ManageRoles)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
        const difficultyName = messageAsList[0];

        let missionDifficulty;
        try {
            missionDifficulty = await MissionDifficultyFactory.getInstance().getByName(difficultyName, message.guildId!);
        } catch {
            message.reply(`Não foi encontrado uma dificuldade de missão com o nome **${difficultyName}**`);
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

        const created = await ClassObjectiveFactory.getInstance().create(
            missionName,
            xp,
            gold,
            missionDifficulty.id,
            description,
            message.guildId!,
        );

        message.reply(
            `Objetivo de classe **${created.name}** criado com sucesso com a dificuldade **${missionDifficulty.name}**`,
        );
        return;
    }
}
