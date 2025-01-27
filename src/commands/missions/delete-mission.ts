import { Message, PermissionFlagsBits } from 'discord.js';
import hasPermission from '../../decorators/has-permission';
import { default as MissionFactory } from '../../factories/missions/mission-factory';
import addConfirmation from '../../utils/confirmation-row';
import Command from '../base-command';

export default class DeleteMission implements Command {
    @hasPermission(PermissionFlagsBits.ManageRoles)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
        const missionName = messageAsList.join(' ');

        let mission;
        try {
            mission = await MissionFactory.getInstance().getByName(missionName, message.guildId!);
        } catch {
            message.reply(`Não foi encontrado nenhuma missão com o nome **${missionName}**.`);
            return;
        }

        await addConfirmation({
            message,
            timeToInteract: 30_000,
            confirmationMsgContent: `Atenção, você está prestes a deletar a missão **${mission.name}**, tem certeza que quer fazer isso?`,
            interactionFilter(interaction) {
                return interaction.user.id === message.author.id;
            },
            actions: {
                async callbackFnAccept(confirmationMessage) {
                    await MissionFactory.getInstance().delete(mission.id);

                    confirmationMessage.edit({
                        content: `Missão **${mission.name}** deletada com sucesso`,
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
