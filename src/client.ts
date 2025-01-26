import { Client as DiscordClient, Events, GatewayIntentBits, Message } from 'discord.js';
import Command from './commands/base-command';

export default class Client {
    private token: string | undefined;
    private client: DiscordClient;
    private prefix: string;
    private commands: { [k: string]: Command } = {};

    constructor(prefix: string) {
        this.token = process.env.DISCORD_TOKEN;
        this.client = new DiscordClient({
            intents: [
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
            ],
        });
        this.prefix = prefix;

        if (typeof this.token === 'undefined') {
            throw new Error('DISCORD_TOKEN not found in environment variables.');
        }

        this.client.once(Events.ClientReady, (readyClient) => {
            console.log(`Bot Ready! Logged in as ${readyClient.user.tag}`);
        });

        this.client.login(this.token);
        this.client.on(Events.MessageCreate, async (message) => {
            if (!message.content.startsWith(this.prefix)) {
                return;
            }
            const commandAsList = message.content.split(' ');
            const command = commandAsList[0].toLowerCase();

            try {
                await this.executeCommand(command, message, commandAsList);
            } catch (e) {
                console.log(e);
                if (e instanceof Error) {
                    if (e.message.includes('does not exist')) {
                        await message.reply(`O comando **${command}** não existe`);
                        return;
                    }
                    await message.reply(`Erro ao executar comando: ${e.name}:${e.message}`);
                }
                return;
            }
        });
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

    private async executeCommand(key: string, message: Message, commandAsList: Array<string>): Promise<void> {
        key = key.replace(this.prefix, '');
        if (!this.commands[key]) {
            throw new Error(`Command ${key} does not exist!`);
        }

        await this.commands[key].execute(message, commandAsList);
    }

    get getClient() {
        return this.client;
    }
}
