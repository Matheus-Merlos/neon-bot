import { Message } from 'discord.js';
import { eq, InferInsertModel } from 'drizzle-orm';
import db from '../../db/db';
import { character } from '../../db/schema';
import { getCharacter } from '../../utils';
import Strategy from '../base-strategy';

export default class EditCharacterFieldStrategy implements Strategy {
    constructor(private readonly field: keyof InferInsertModel<typeof character>) {}

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const char = await getCharacter(message, messageAsList);

        const newValue = messageAsList.join(' ').replaceAll('"', '').replaceAll("'", '');
        if (newValue.length === 0) {
            message.reply('Você não forneceu um valor válido');
            return;
        }

        await db
            .update(character)
            .set({
                [this.field]: newValue,
            })
            .where(eq(character.id, char.id));

        await message.reply('Personagem editado com sucesso.');
    }
}
