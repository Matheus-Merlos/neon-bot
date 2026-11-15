import { ChatInputCommandInteraction, Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { character } from '../../db/schema';
import { ImageHandler } from '../../utils';
import addConfirmation from '../../utils/confirmation-row';
import { IStrategy } from '../base-strategy';

type Input = Record<string, never>;

export default class NewGenStrategy implements IStrategy<Input> {
    async handleInput(
        _input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const userId = 'author' in replyInstance ? replyInstance.author.id : replyInstance.user.id;

        await addConfirmation({
            replyInstance,
            confirmationMsgContent: `Atenção: Isso irá deletar **TODOS** os personagens de **TODOS** os jogadores, você tem certeza que quer fazer isso?`,
            timeToInteract: 30_000,
            interactionFilter: (i) => i.user.id === userId,
            actions: {
                async callbackFnAccept(confirmationMessage: Message) {
                    const chars = await db.select().from(character);
                    for (const char of chars) {
                        await ImageHandler.deleteImage('characters', char.salt!, char.name);
                        await db.delete(character).where(eq(character.id, char.id));
                    }

                    await confirmationMessage.edit({
                        content: `Geração resetada com sucesso.`,
                        components: [],
                    });
                },
                callbackFnDecline() {
                    throw new Error();
                },
            },
        });
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        await this.handleInput({}, interaction);
    }

    async execute(message: Message<true>): Promise<void> {
        await this.handleInput({}, message);
    }
}
