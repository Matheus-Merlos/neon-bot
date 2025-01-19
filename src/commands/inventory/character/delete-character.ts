import { Message } from 'discord.js';
import Command from '../../base-command';

export default class DeleteCharacter implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {}
}
