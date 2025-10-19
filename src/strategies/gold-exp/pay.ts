import { Message } from 'discord.js';
import { CharacterFactory } from '../../factories';
import getIdFromMention from '../../utils/get-id-from-mention';
import Strategy from '../base-strategy';

export default class PayStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const senderId = message.author.id;
        const receiverId = getIdFromMention(messageAsList[0]);
        const quantity = parseInt(messageAsList[1]);

        const sender = await CharacterFactory.getFromPlayerId(senderId, message.guildId!);
        const receiver = await CharacterFactory.getFromPlayerId(receiverId, message.guildId!);

        if (sender.gold < quantity) {
            await message.reply(
                'Você não possui dinheiro o suficiente para realizar essa transação.',
            );
            return;
        }

        await CharacterFactory.edit(sender.id, { gold: sender.gold - quantity });
        await CharacterFactory.edit(receiver.id, { gold: receiver.gold + quantity });

        await message.reply(`Você depositou **${quantity}** para <@${receiver.player}>.`);
    }
}
