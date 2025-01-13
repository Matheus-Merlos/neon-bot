import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { character } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import { getIdFromMention } from '../../utils';
import Command from '../base-command';

export default class Pay implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const senderId = message.author.id;
        const receiverId = getIdFromMention(messageAsList[1]);
        const quantity = parseInt(messageAsList[2]);

        const sender = await CharacterFactory.getFromId(senderId, message);
        const receiver = await CharacterFactory.getFromId(receiverId, message);

        if (sender.gold < quantity) {
            await message.reply(
                'Você não possui dinheiro o suficiente para realizar essa transação.',
            );
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
