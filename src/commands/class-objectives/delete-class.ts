import { Message, PermissionFlagsBits } from 'discord.js';
import hasPermission from '../../decorators/has-permission';
import ClassFactory from '../../factories/class-objectives/class-factory';
import addConfirmation from '../../utils/confirmation-row';
import Command from '../base-command';

export default class DeleteClass implements Command {
    @hasPermission(PermissionFlagsBits.ManageRoles)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
        const clsName = messageAsList.join(' ');

        let cls;
        try {
            cls = await ClassFactory.getInstance().getByName(clsName);
        } catch {
            message.reply(`Não foi encontrado nenhuma classe com o nome **${clsName}**.`);
            return;
        }

        await addConfirmation({
            message,
            timeToInteract: 30_000,
            confirmationMsgContent: `Atenção, você está prestes a deletar a classe **${cls.name}**, tem certeza que quer fazer isso?`,
            interactionFilter(interaction) {
                return interaction.user.id === message.author.id;
            },
            actions: {
                async callbackFnAccept(confirmationMessage) {
                    await ClassFactory.getInstance().delete(cls.id);

                    confirmationMessage.edit({ content: `Classe **${cls.name}** deletada com sucesso`, components: [] });
                    return;
                },
                callbackFnDecline() {
                    throw new Error();
                },
            },
        });
    }
}
