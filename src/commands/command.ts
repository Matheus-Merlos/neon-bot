import { Message } from 'discord.js';

export interface Command {
    execute(message: Message): Promise<void>;
}

//Invoker class of the Command Design Pattern
export class App {
    private commands: { [k: string]: Command } = {};

    public addCommand(key: string | Array<string>, command: Command): void {
        if (typeof key === 'string') {
            this.addKey(key, command);
        }

        for (const k of key) {
            this.addKey(k, command);
        }
    }

    public async executeCommand(key: string, message: Message): Promise<void> {
        if (!this.commands[key]) {
            throw new Error(`Key ${key} does not exist!`);
        }
        await this.commands[key].execute(message);
    }

    private addKey(key: string, command: Command): void {
        if (key in this.commands) throw new Error(`Key ${key} already exists!`);
        this.commands[key] = command;
        return;
    }
}
