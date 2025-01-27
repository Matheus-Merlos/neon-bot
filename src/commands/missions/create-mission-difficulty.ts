import { Message, PermissionFlagsBits } from 'discord.js';
import hasPermission from '../../decorators/has-permission';
import MissionDifficultyFactory from '../../factories/missions/mission-difficulty-factory';
import Command from '../base-command';

export default class CreateMissionDifficulty implements Command {
    @hasPermission(PermissionFlagsBits.ManageRoles)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);

        if (messageAsList.length > 1) {
            message.reply('O nome da dificuldade não pode ter mais que uma palavra.');
            return;
        }

        const difficultyName = messageAsList[0];
        const diff = await MissionDifficultyFactory.getInstance().create({ name: difficultyName, guildId: message.guildId! });

        await message.reply(`Dificuldade de objetivo **${diff.name}** criada com sucesso!`);
    }
}
