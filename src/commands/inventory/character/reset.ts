import { Message, PermissionFlagsBits } from 'discord.js';
import hasPermission from '../../../decorators/has-permission';
import CharacterFactory from '../../../factories/character-factory';
import addConfirmation from '../../../utils/confirmation-row';
import getIdFromMention from '../../../utils/get-id-from-mention';
import Command from '../../base-command';

export default class Reset implements Command {
    @hasPermission(PermissionFlagsBits.Administrator)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        await addConfirmation({
            message: message,
            confirmationMsgContent: `Atenção: Isso irá deletar tudo relacionado ao personagem de **${messageAsList[1] ? messageAsList[1] : `<@${message.author.id}>`}**. Você tem certeza que quer fazer isso?`,
            timeToInteract: 30_000,
            interactionFilter: (i) => i.user.id === message.author.id,
            actions: {
                async callbackFnAccept(confirmationMessage: Message) {
                    const char = await CharacterFactory.getInstance().getFromPlayerId(
                        getIdFromMention(messageAsList[1]),
                        message.guild!.id,
                    );

                    await CharacterFactory.getInstance().delete(char.id);

                    await confirmationMessage.edit({
                        content: `Personagem de **${messageAsList[1]}** resetado com sucesso.`,
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
