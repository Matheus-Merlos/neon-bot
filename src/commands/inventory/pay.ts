import { Message } from 'discord.js';
import { Command } from '../command';
import { getIdFromMention } from '../../utils';
import { CharacterFactory } from './character';

export default class Pay implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray = message.content.split(' ');

        const sender = message.author.id;
        const receiver = getIdFromMention(msgArray[1]);

        const quantity = parseInt(msgArray[2]);

        const senderCharacter = await CharacterFactory.retrieveFromId(BigInt(sender));
        const receiverCharacter = await CharacterFactory.retrieveFromId(BigInt(receiver));

        await senderCharacter.removeGold(quantity);
        await senderCharacter.addGold(quantity);

        await message.reply(
            `Você pagou **$${quantity}** para **${receiverCharacter.playerMention()}**`,
        );
    }
}
