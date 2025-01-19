import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Message,
    PermissionFlagsBits,
} from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { item as itemTable } from '../../../db/schema';
import hasPermission from '../../../decorators/has-permission';
import ImageFactory from '../../../factories/image-factory';
import ItemFactory from '../../../factories/item-factory';
import { toSlug } from '../../../utils';
import Command from '../../base-command';

enum DeleteItemActions {
    CANCEL = 'cancel',
    ACCEPT = 'accept',
}

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

        const cancelButton = new ButtonBuilder()
            .setCustomId(DeleteItemActions.CANCEL)
            .setStyle(ButtonStyle.Primary)
            .setLabel('Cancelar');

        const acceptButton = new ButtonBuilder()
            .setCustomId(DeleteItemActions.ACCEPT)
            .setStyle(ButtonStyle.Danger)
            .setLabel('Confirmar');

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            cancelButton,
            acceptButton,
        );

        const confirmationMessage = await message.reply({
            content: `Atenção: Isso irá deletar o item **${item.name}**. Você tem certeza que quer fazer isso?`,
            components: [buttonRow],
        });

        try {
            const confirmation = await confirmationMessage.awaitMessageComponent({
                filter: (i) => i.user.id === message.author.id,
                time: 30_000,
            });

            if (confirmation.customId === DeleteItemActions.CANCEL) {
                throw new Error();
            }

            if (confirmation.customId === DeleteItemActions.ACCEPT) {
                await ImageFactory.getInstance().deleteImage(
                    'items',
                    `${item.salt}-${toSlug(item.name)}.png`,
                );

                await db.delete(itemTable).where(eq(itemTable.id, item.id));

                await confirmationMessage.edit({
                    content: `Item **${item.name}** deletado com sucesso.`,
                    components: [],
                });
                confirmation.deferUpdate();
                return;
            }
        } catch {
            await confirmationMessage.edit({ content: `Operação cancelada.`, components: [] });
            return;
        }
    }
}
