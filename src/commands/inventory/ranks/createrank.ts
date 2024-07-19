import { Message } from 'discord.js';
import { Command } from '../../command';

export default class CreateRank implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray: Array<string> = message.content.split(' ');

        const rankName: string = msgArray[1];
        const rankExp: number = parseInt(msgArray[2]);
    }
}
