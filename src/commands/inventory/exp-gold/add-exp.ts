import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { character } from '../../../db/schema';
import CharacterFactory from '../../../factories/character-factory';
import checkCaracterLevelUp from '../../../utils/check-character-levelup';
import getIdFromMention from '../../../utils/get-id-from-mention';
import Command from '../../base-command';

export default class AddExp implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const playerId = getIdFromMention(messageAsList[1]);
        const quantity = parseInt(messageAsList[2]);

        const char = await CharacterFactory.getInstance().getFromPlayerId(playerId, message.guild!.id);

        await checkCaracterLevelUp(message, char, quantity);

        await db
            .update(character)
            .set({ xp: char.xp + quantity })
            .where(eq(character.id, char.id));

        await message.reply(`${quantity} de exp adicionado com sucesso para **${char.name}**`);
    }
}
