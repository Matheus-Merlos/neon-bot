import { Guild, Message } from 'discord.js';
import { Command } from '../../command';
import { addPlayerAndCharacterIfNotExists, getIdFromMention } from '../../../utils';
import { CharacterFactory, Character } from '../character';

export class AddExp implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray: Array<string> = message.content.split(' ');
        if (msgArray.length !== 3) {
            message.reply('A sintaxe do comando está errada');
            return;
        }

        const mention: string = msgArray[1];
        if (!mention.includes('@')) {
            message.reply('O player informado não é um player válido');
            return;
        }

        const id: string = getIdFromMention(mention);

        const quantity: number = parseInt(msgArray[2]);
        if (isNaN(quantity)) {
            message.reply('A quantidade informada é inválida');
            return;
        }

        const guild: Guild = message.guild!;
        await addPlayerAndCharacterIfNotExists(id, guild);

        const character: Character = await CharacterFactory.retrieveFromId(BigInt(id));

        await character.addExp(quantity);

        message.reply('Adicionado com sucesso!');
    }
}
