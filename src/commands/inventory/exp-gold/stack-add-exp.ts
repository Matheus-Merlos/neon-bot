import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { character } from '../../../db/schema';
import CharacterFactory from '../../../factories/character-factory';
import checkCaracterLevelUp from '../../../utils/check-character-levelup';
import getIdFromMention from '../../../utils/get-id-from-mention';
import Command from '../../base-command';

export default class StackAddExp implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const quantity = parseInt(messageAsList[0]);

        messageAsList.splice(0, 1);

        const playersId = messageAsList.map((mention) => getIdFromMention(mention));
        const characters = [];
        for (const playerId of playersId) {
            characters.push(await CharacterFactory.getFromPlayerId(playerId, message.guild!.id));
        }

        for (const char of characters) {
            await checkCaracterLevelUp(message, char, quantity);

            await db
                .update(character)
                .set({ xp: char.xp + quantity })
                .where(eq(character.id, char.id));

            await message.reply(`${quantity} de exp adicionado com sucesso para **${char.name}**`);
        }
    }
}
