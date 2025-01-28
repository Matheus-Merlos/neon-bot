import { Message, PermissionFlagsBits } from 'discord.js';
import hasPermission from '../../decorators/has-permission';
import MissionDifficultyFactory from '../../factories/missions/mission-difficulty-factory';
import addConfirmation from '../../utils/confirmation-row';
import Command from '../base-command';

export default class DeleteMissionDifficulty implements Command {
    @hasPermission(PermissionFlagsBits.ManageRoles)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
        const missionDifficultyName = messageAsList.join(' ');

        let missionDifficulty;
        try {
            missionDifficulty = await MissionDifficultyFactory.getInstance().getByName(missionDifficultyName, message.guildId!);
        } catch {
            message.reply(`Não foi encontrado nenhuma dificuldade de missão com o nome **${missionDifficultyName}**.`);
            return;
        }

        await addConfirmation({
            message,
            timeToInteract: 30_000,
            confirmationMsgContent: `Atenção, você está prestes a deletar a dificuldade de missão **${missionDifficulty.name}**, tem certeza que quer fazer isso?`,
            interactionFilter(interaction) {
                return interaction.user.id === message.author.id;
            },
            actions: {
                async callbackFnAccept(confirmationMessage) {
                    await MissionDifficultyFactory.getInstance().delete(missionDifficulty.id);

                    confirmationMessage.edit({
                        content: `Dificuldade **${missionDifficulty.name}** deletada com sucesso`,
                        components: [],
                    });
                    return;
                },
                callbackFnDecline() {
                    throw new Error();
                },
            },
        });
    }
}
