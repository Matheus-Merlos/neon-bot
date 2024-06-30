import { Message } from 'discord.js';
import { songNames, posicaoAtual, removeFromQueue } from './play';

export default async function remove(message: Message) {
    const msgString: Array<string> = message.content.split(' ');

    let position: number;
    position = parseInt(msgString[1]);
    if (isNaN(position)) {
        message.reply('Não foi informado uma posição válida');
        return;
    }

    if (position === 1) {
        message.reply(
            'Essa posição é a música que está tocando atualmente, opte por usar o comando `;skip`',
        );
        return;
    }

    const songs = songNames.slice(posicaoAtual);
    if (position > songs.length) {
        message.reply('Essa posição é inválida');
        return;
    }

    position--;

    const realPosition: number = position + posicaoAtual;

    message.reply(`**Removido** :notes: __**${songNames[realPosition]}**__ da fila`);

    removeFromQueue(realPosition);
}
