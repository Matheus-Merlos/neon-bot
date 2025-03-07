import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { character } from '../../../db/schema';
import CharacterFactory from '../../../factories/character-factory';
import getIdFromMention from '../../../utils/get-id-from-mention';
import Command from '../../base-command';

export default class Pay implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const senderId = message.author.id;
        const receiverId = getIdFromMention(messageAsList[0]);
        const quantity = parseInt(messageAsList[1]);

        const sender = await CharacterFactory.getInstance().getFromPlayerId(senderId, message.guildId!);
        const receiver = await CharacterFactory.getInstance().getFromPlayerId(receiverId, message.guildId!);

        if (sender.gold < quantity) {
            await message.reply('Você não possui dinheiro o suficiente para realizar essa transação.');
            return;
        }

        await db.transaction(async (trx) => {
            await trx
                .update(character)
                .set({ gold: sender.gold - quantity })
                .where(eq(character.id, sender.id));

            await trx
                .update(character)
                .set({ gold: receiver.gold + quantity })
                .where(eq(character.id, receiver.id));
        });

        await message.reply(`Você depositou **${quantity}** para <@${receiver.player}>.`);
    }
}
