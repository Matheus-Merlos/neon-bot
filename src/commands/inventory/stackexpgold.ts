import { addPlayerAndCharacterIfNotExists, getIdFromMention } from '../../utils';
import { Command } from '../command';
import { Guild, Message } from 'discord.js';
import { Character, CharacterFactory } from './character';

abstract class StackAddResource implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray: Array<string> = message.content.split(' ');

        if (!(msgArray.length > 2)) {
            message.reply('Sintaxe do comando errada!');
            return;
        }

        const quantity: number = parseInt(msgArray[1]);
        if (isNaN(quantity)) {
            message.reply('Quantidade inválida');
        }

        const idList: Array<string> = msgArray
            .slice(2)
            .filter((mention: string) => mention.includes('@'))
            .map((mention: string) => getIdFromMention(mention));

        const guild: Guild = message.guild!;
        idList.forEach(async (id: string) => {
            await addPlayerAndCharacterIfNotExists(id, guild);
            await this.add(id, quantity, message);
        });
    }
    protected abstract add(playerId: string, quantity: number, message: Message): Promise<void>;
}

export class StackAddGold extends StackAddResource {
    protected async add(playerId: string, quantity: number, message: Message) {
        const character: Character = await CharacterFactory.retrieveFromId(BigInt(playerId));

        await character.addGold(quantity);

        message.channel.send(
            `${quantity} de gold adicionado com sucesso para **${character.characterName}**!`,
        );
    }
}

export class StackAddExp extends StackAddResource {
    protected async add(playerId: string, quantity: number, message: Message) {
        const character: Character = await CharacterFactory.retrieveFromId(BigInt(playerId));

        await character.addExp(quantity);

        message.channel.send(
            `${quantity} de gold adicionado com sucesso para **${character.characterName}**!`,
        );
    }
}
