import { Message, PermissionFlagsBits } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { character } from '../../../db/schema';
import hasMention from '../../../decorators/has-mention';
import hasPermission from '../../../decorators/has-permission';
import CharacterFactory from '../../../factories/character-factory';
import ImageFactory from '../../../factories/image-factory';
import { getIdFromMention } from '../../../utils';
import Command from '../../base-command';
import addConfirmation from '../../confirmation';

export default class Reset implements Command {
    @hasPermission(PermissionFlagsBits.Administrator)
    @hasMention()
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        await addConfirmation({
            message: message,
            confirmationMsgContent: `Atenção: Isso irá deletar tudo relacionado ao personagem de **${messageAsList[1]}**. Você tem certeza que quer fazer isso?`,
            timeToInteract: 30_000,
            interactionFilter: (i) => i.user.id === message.author.id,
            actions: {
                async callbackFnAccept(confirmationMessage: Message) {
                    const char = await CharacterFactory.getFromId(
                        getIdFromMention(messageAsList[1]),
                        message,
                    );

                    await ImageFactory.getInstance().deleteImage(
                        'characters',
                        `${char.salt}-${char.name}.png`,
                    );

                    await db.delete(character).where(eq(character.id, char.id));

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
