import { Message } from 'discord.js';
import { AudioPlayerCommand } from './audio-player';

export class Skip extends AudioPlayerCommand {
    public async execute(message: Message): Promise<void> {
        this.player.skip(message);
    }
}
