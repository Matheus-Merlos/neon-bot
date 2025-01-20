import { Message, PermissionFlagsBits } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { character } from '../../../db/schema';
import hasPermission from '../../../decorators/has-permission';
import ImageFactory from '../../../factories/image-factory';
import addConfirmation from '../../../utils/confirmation-row';
import Command from '../../base-command';

export default class NewGen implements Command {
    @hasPermission(PermissionFlagsBits.Administrator)
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
                        await ImageFactory.getInstance().deleteImage(
                            'characters',
                            `${char.salt}-${char.name}.png`,
                        );

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
