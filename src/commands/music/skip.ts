import { Message } from 'discord.js';
import { queue, increasePosition, player, posicaoAtual } from './play';

export default async function skip(message: Message): Promise<void> {
    if (message.member!.voice.channel === null) {
        message.reply('Você não está em um canal de voz!');
    }

    player.stop();
    increasePosition();
    player.play(queue[posicaoAtual]);

    message.reply('Skippei a música');
}
