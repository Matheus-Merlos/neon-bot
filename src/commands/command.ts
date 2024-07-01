import { Message } from 'discord.js';

export default abstract class Command {
    public readonly message: Message;
    public readonly commandSyntaxes: Array<string>;

    constructor(message: Message, commandSyntaxes: Array<string>) {
        this.message = message;
        this.commandSyntaxes = commandSyntaxes;
    }

    public abstract execute(): Promise<void>;
}
