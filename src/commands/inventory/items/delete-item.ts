import { Message, PermissionFlagsBits } from 'discord.js';
import hasPermission from '../../../decorators/has-permission';
import ItemFactory from '../../../factories/item-factory';
import addConfirmation from '../../../utils/confirmation-row';
import Command from '../../base-command';

export default class DeleteItem implements Command {
    @hasPermission(PermissionFlagsBits.ManageChannels)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);

        const itemName = messageAsList.join(' ');
        let item;
        try {
            item = await ItemFactory.getInstance().getByName(itemName, message.guildId!);
        } catch {
            message.reply(`Não foi encontrado um item com o nome **${itemName}**`);
            return;
        }

        await addConfirmation({
            message: message,
            confirmationMsgContent: `Atenção: Isso irá deletar o item **${item.name}**. Você tem certeza que quer fazer isso?`,
            timeToInteract: 30_000,
            interactionFilter: (i) => i.user.id === message.author.id,
            actions: {
                async callbackFnAccept(confirmationMessage: Message) {
                    await ItemFactory.getInstance().delete(item.id);

                    await confirmationMessage.edit({
                        content: `Item **${item.name}** deletado com sucesso.`,
                        components: [],
                    });
                    return;
                },
                //Throwing a error because tha catch will just edit the message
                callbackFnDecline() {
                    throw new Error();
                },
            },
        });
    }
}
