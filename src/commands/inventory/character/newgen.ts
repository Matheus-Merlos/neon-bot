import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Message,
    PermissionFlagsBits,
} from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { character } from '../../../db/schema';
import hasPermission from '../../../decorators/has-permission';
import ImageFactory from '../../../factories/image-factory';
import Command from '../../base-command';

enum ResetActions {
    CANCEL = 'cancel',
    ACCEPT = 'accept',
}

export default class NewGen implements Command {
    @hasPermission(PermissionFlagsBits.Administrator)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const cancelButton = new ButtonBuilder()
            .setCustomId(ResetActions.CANCEL)
            .setStyle(ButtonStyle.Primary)
            .setLabel('Cancelar');

        const acceptButton = new ButtonBuilder()
            .setCustomId(ResetActions.ACCEPT)
            .setStyle(ButtonStyle.Danger)
            .setLabel('Confirmar');

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            cancelButton,
            acceptButton,
        );

        const confirmationMessage = await message.reply({
            content: `Atenção: Isso irá deletar **TODOS** os personagens de **TODOS** os jogadores, você tem certeza que quer fazer isso?`,
            components: [buttonRow],
        });

        try {
            const confirmation = await confirmationMessage.awaitMessageComponent({
                filter: (i) => i.user.id === message.author.id,
                time: 30_000,
            });

            if (confirmation.customId === ResetActions.CANCEL) {
                throw new Error();
            }

            if (confirmation.customId === ResetActions.ACCEPT) {
                const chars = await db.select().from(character);
                chars.forEach(async (char) => {
                    await ImageFactory.getInstance().deleteImage(
                        'characters',
                        `${char.salt}-${char.name}.png`,
                    );

                    await db.delete(character).where(eq(character.id, char.id));
                });

                await confirmation.update({
                    content: `Geração resetada com sucesso.`,
                    components: [],
                });
                return;
            }
        } catch {
            await confirmationMessage.edit({ content: `Operação cancelada.`, components: [] });
            return;
        }
    }
}
