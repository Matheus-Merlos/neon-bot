import { Message } from 'discord.js';
import { AudioPlayerCommand } from './audio-player';

export class Remove extends AudioPlayerCommand {
    public async execute(message: Message): Promise<void> {
        this.player.remove(message);
    }
}
