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
import CharacterFactory from '../../../factories/character-factory';
import { getIdFromMention } from '../../../utils';
import Command from '../../base-command';

enum ResetActions {
    CANCEL = 'cancel',
    ACCEPT = 'accept',
}

export default class Reset implements Command {
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
            content: `Atenção: Isso irá deletar tudo relacionado ao personagem de **${messageAsList[1]}**. Você tem certeza que quer fazer isso?`,
            components: [buttonRow],
        });

        try {
            const confirmation = await confirmationMessage.awaitMessageComponent({
                filter: (i) => i.user.id === message.author.id,
                time: 15_000,
            });

            if (confirmation.customId === ResetActions.ACCEPT) {
                const char = await CharacterFactory.getFromId(
                    getIdFromMention(messageAsList[1]),
                    message,
                );

                await db.delete(character).where(eq(character.id, char.id));

                await confirmation.update({
                    content: `Personagem de **${messageAsList[1]}** resetado com sucesso.`,
                    components: [],
                });
                return;
            }

            if (confirmation.customId === ResetActions.CANCEL) {
                throw new Error();
            }
        } catch {
            await confirmationMessage.edit({ content: `Operação cancelada.`, components: [] });
            return;
        }
    }
}
