import { Message } from 'discord.js';

export default interface Strategy {
    execute(message: Message<true>, messageAsList: Array<string>): Promise<void>;
}
