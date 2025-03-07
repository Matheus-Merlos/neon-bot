import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { character } from '../../../db/schema';
import CharacterFactory from '../../../factories/character-factory';
import getIdFromMention from '../../../utils/get-id-from-mention';
import Command from '../../base-command';

export default class StackAddGold implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const quantity = parseInt(messageAsList[1]);

        messageAsList.splice(0, 2);

        const playersId = messageAsList.map((mention) => getIdFromMention(mention));
        const characters = [];
        for (const playerId of playersId) {
            characters.push(await CharacterFactory.getInstance().getFromPlayerId(playerId, message.guild!.id));
        }

        for (const char of characters) {
            await db
                .update(character)
                .set({ gold: char.gold + quantity })
                .where(eq(character.id, char.id));

            await message.reply(`**${quantity}** de dinheiro adicionado com sucesso para **${char.name}**`);
        }
    }
}
