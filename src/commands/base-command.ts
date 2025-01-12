import { Message } from 'discord.js';

export default interface Command {
    execute(message: Message, messageAsList: Array<string>): Promise<void>;
}
