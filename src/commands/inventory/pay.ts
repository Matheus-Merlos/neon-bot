import { Message } from 'discord.js';
import { Command } from '../command';
import { addPlayerAndCharacterIfNotExists, getIdFromMention } from '../../utils';
import { CharacterFactory } from './character';

export default class Pay implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray = message.content.split(' ');

        const sender = message.author.id;
        const receiver = getIdFromMention(msgArray[1]);
        if (!receiver.includes('@')) {
            message.reply('Sintaxe do comando errada');
            return;
        }

        const quantity = parseInt(msgArray[2]);
        if (isNaN(quantity)) {
            message.reply('Quantidade informada é inválida');
            return;
        }

        await addPlayerAndCharacterIfNotExists(sender, message.guild!);
        await addPlayerAndCharacterIfNotExists(receiver, message.guild!);

        const senderCharacter = await CharacterFactory.retrieveFromId(BigInt(sender));
        const receiverCharacter = await CharacterFactory.retrieveFromId(BigInt(receiver));

        if (senderCharacter.money < quantity) {
            message.reply('Você não tem dinheiro o suficiente para realizar essa ação');
            return;
        }

        await senderCharacter.removeGold(quantity);
        await senderCharacter.addGold(quantity);

        await message.reply(
            `Você pagou **$${quantity}** para **${receiverCharacter.playerMention()}**`,
        );
    }
}
