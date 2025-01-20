import { Message, PermissionFlagsBits } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { item as itemTable } from '../../../db/schema';
import hasPermission from '../../../decorators/has-permission';
import ImageFactory from '../../../factories/image-factory';
import ItemFactory from '../../../factories/item-factory';
import { toSlug } from '../../../utils';
import Command from '../../base-command';
import addConfirmation from '../../confirmation';

export default class DeleteItem implements Command {
    @hasPermission(PermissionFlagsBits.ManageChannels)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);

        const itemName = messageAsList.join(' ');
        let item;
        try {
            item = await ItemFactory.getFromName(itemName);
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
                    await ImageFactory.getInstance().deleteImage(
                        'items',
                        `${item.salt}-${toSlug(item.name)}.png`,
                    );

                    await db.delete(itemTable).where(eq(itemTable.id, item.id));

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
