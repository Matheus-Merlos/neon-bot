import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { character } from '../../../db/schema';
import { ImageHandler } from '../../../utils';
import addConfirmation from '../../../utils/confirmation-row';
import Command from '../../base-command';

export default class NewGen implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        await addConfirmation({
            message: message,
            confirmationMsgContent: `Atenção: Isso irá deletar **TODOS** os personagens de **TODOS** os jogadores, você tem certeza que quer fazer isso?`,
            timeToInteract: 30_000,
            interactionFilter: (i) => i.user.id === message.author.id,
            actions: {
                async callbackFnAccept(confirmationMessage: Message) {
                    const chars = await db.select().from(character);
                    chars.forEach(async (char) => {
                        await ImageHandler.deleteImage('characters', char.salt!, char.name);

                        await db.delete(character).where(eq(character.id, char.id));
                    });

                    await confirmationMessage.edit({
                        content: `Geração resetada com sucesso.`,
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
