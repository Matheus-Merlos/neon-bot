import { Message } from 'discord.js';
import { player, resetConnection } from './play';

export default async function disconnect(message: Message) {
    player.stop();
    resetConnection();

    message.reply('Desconectado');
}
