import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction, Message } from 'discord.js';

enum Actions {
    ACCEPT = 'accept',
    DECLINE = 'decline',
}

export default async function addConfirmation({
    message,
    confirmationMsgContent,
    timeToInteract,
    interactionFilter,
    actions,
}: {
    message: Message;
    confirmationMsgContent: string;
    timeToInteract: number;
    interactionFilter: (interaction: Interaction) => boolean;
    actions: {
        callbackFnAccept: (confirmationMessage: Message) => void | Promise<void>;
        callbackFnDecline: (confirmationMessage: Message) => void | Promise<void>;
    };
}) {
    const cancelButton = new ButtonBuilder()
        .setCustomId(Actions.DECLINE)
        .setStyle(ButtonStyle.Primary)
        .setLabel('Cancelar');

    const acceptButton = new ButtonBuilder()
        .setCustomId(Actions.ACCEPT)
        .setStyle(ButtonStyle.Danger)
        .setLabel('Confirmar');

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        cancelButton,
        acceptButton,
    );

    const confirmationMessage = await message.reply({
        content: confirmationMsgContent,
        components: [buttonRow],
    });

    try {
        const confirmation = await confirmationMessage.awaitMessageComponent({
            filter: interactionFilter,
            time: timeToInteract,
        });

        if (confirmation.customId === Actions.DECLINE) {
            actions.callbackFnDecline(confirmationMessage);
            confirmation.deferUpdate();
            return;
        }

        if (confirmation.customId === Actions.ACCEPT) {
            actions.callbackFnAccept(confirmationMessage);
            confirmation.deferUpdate();
            return;
        }
    } catch {
        await confirmationMessage.edit({ content: `Operação cancelada.`, components: [] });
        return;
    }
}
