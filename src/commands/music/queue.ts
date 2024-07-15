import { Message } from 'discord.js';
import { AudioPlayerCommand } from './audio-player';

export class SongQueue extends AudioPlayerCommand {
    public async execute(message: Message): Promise<void> {
        this.player.songQueue(message);
    }
}
