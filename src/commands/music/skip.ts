import { Message } from 'discord.js';
import { queue, increasePosition, player, posicaoAtual } from './play';

export default async function skip(message: Message): Promise<void> {
    if (message.member!.voice.channel === null) {
        message.reply('Você não está em um canal de voz!');
    }

    if (posicaoAtual + 1 > queue.length - 1) {
        message.reply('Não há mais músicas na fila!');
        return;
    }

    increasePosition();
    player.stop();
    player.play(queue[posicaoAtual]);

    message.reply('Skippei a música');
}
