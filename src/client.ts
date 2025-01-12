import { Client as DiscordClient, Events, GatewayIntentBits, Message } from 'discord.js';
import Command from './commands/base-command';

export default class Client {
    private token: string | undefined;
    private client: DiscordClient;
    private prefix: string;
    private commands: { [k: string]: Command } = {};

    constructor(prefix: string) {
        this.token = process.env.DISCORD_TOKEN;
        this.client = new DiscordClient({ intents: [GatewayIntentBits.MessageContent] });
        this.prefix = prefix;

        if (typeof this.token === 'undefined') {
            throw new Error('DISCORD_TOKEN not found in environment variables.');
        }

        this.client.once(Events.ClientReady, (readyClient) => {
            console.log(`Bot Ready! Logged in as ${readyClient.user.tag}`);
        });

        this.client.on(Events.MessageCreate, this.handleCommands);

        this.client.login(this.token);
    }

    private async handleCommands(message: Message): Promise<void> {
        if (!message.content.startsWith(this.prefix)) {
            return;
        }
        const commandAsList = message.content.split(' ');
        const command = commandAsList[0].toLowerCase();

        try {
            this.executeCommand(command, message, commandAsList);
        } catch (e) {
            console.log(e);
            message.reply('Não existe um comando com essa sintaxe!');
        }
    }

    public addCommand(key: string | Array<string>, command: Command): void {
        if (typeof key === 'string') {
            this.addKey(key, command);
            return;
        }

        for (const k of key) {
            this.addKey(k, command);
        }
    }

    private addKey(key: string, command: Command): void {
        if (key in this.commands) throw new Error(`Key ${key} already exists!`);
        this.commands[key] = command;
        return;
    }

    private async executeCommand(
        key: string,
        message: Message,
        commandAsList: Array<string>,
    ): Promise<void> {
        if (!this.commands[key]) {
            throw new Error(`Command ${key} does not exist!`);
        }

        await this.commands[key].execute(message, commandAsList);
    }
}
