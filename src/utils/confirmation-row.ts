import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Interaction,
    Message,
} from 'discord.js';

enum Actions {
    ACCEPT = 'accept',
    DECLINE = 'decline',
}

export default async function addConfirmation({
    replyInstance,
    confirmationMsgContent,
    timeToInteract,
    interactionFilter,
    actions,
}: {
    replyInstance: ChatInputCommandInteraction | Message<true>;
    confirmationMsgContent: string;
    timeToInteract: number;
    interactionFilter: (interaction: Interaction) => boolean;
    actions: {
        callbackFnAccept: (confirmationReply: Message) => void | Promise<void>;
        callbackFnDecline: (confirmationReply: Message) => void | Promise<void>;
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

    let confirmationMessage: Message;

    if ('commandName' in replyInstance) {
        await replyInstance.reply({
            content: confirmationMsgContent,
            components: [buttonRow],
        });
        confirmationMessage = await replyInstance.fetchReply();
    } else {
        confirmationMessage = await replyInstance.reply({
            content: confirmationMsgContent,
            components: [buttonRow],
        });
    }

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
