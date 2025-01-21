import { Message, PermissionFlagsBits } from 'discord.js';
import hasPermission from '../../decorators/has-permission';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import addConfirmation from '../../utils/confirmation-row';
import Command from '../base-command';

export default class DeleteObjective implements Command {
    @hasPermission(PermissionFlagsBits.Administrator)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
        const itemName = messageAsList.join(' ');

        let objective;
        try {
            objective = await ObjectiveFactory.getInstance().getByName(itemName);
        } catch {
            message.reply(`Não existe um objetivo com o nome **${itemName}**.`);
            return;
        }

        addConfirmation({
            message,
            timeToInteract: 30_000,
            confirmationMsgContent: `Atenção: Isso irá deletar completamente o objetivo **${objective.name}**, você tem certeza que quer fazer isso?`,
            interactionFilter: (i) => i.user.id === message.author.id,
            actions: {
                async callbackFnAccept(confirmationMessage: Message) {
                    await ObjectiveFactory.getInstance().delete(objective.id);

                    confirmationMessage.edit({
                        content: `Objetivo **${objective.name}** deletado com sucesso.`,
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
