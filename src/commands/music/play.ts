import { Message } from 'discord.js';
import { AudioPlayerCommand } from './audio-player';

export class Play extends AudioPlayerCommand {
    public async execute(message: Message): Promise<void> {
        await this.player.play(message);
    }
}
