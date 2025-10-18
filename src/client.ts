import { Client as DiscordClient, Events, GatewayIntentBits, WebhookClient } from 'discord.js';
import Command from './commands/base-command';
import npcFactory from './factories/npc-factory';

export default class Client {
    private token: string | undefined;
    private client: DiscordClient;
    private prefix: string;
    private commands: { [k: string]: Command } = {};

    constructor({
        prefix,
        requiredEnvironmentVars,
    }: {
        prefix: string;
        requiredEnvironmentVars: Array<string>;
    }) {
        for (const requiredEnv of requiredEnvironmentVars) {
            const envVar = process.env[requiredEnv];
            if (envVar === undefined) {
                throw new Error(
                    `Required var "${requiredEnv}" not found in environment variables.`,
                );
            }
        }

        this.token = process.env.DISCORD_TOKEN!;
        this.client = new DiscordClient({
            intents: [
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
            ],
        });
        this.prefix = prefix;

        this.client.once(Events.ClientReady, (readyClient) => {
            console.log(`Bot Ready! Logged in as ${readyClient.user.tag}`);
        });

        this.client.login(this.token);
        this.client.on(Events.MessageCreate, async (message) => {
            if (!message.guildId) {
                return;
            }

            if (message.webhookId) {
                return;
            }

            const activeNPCInGuild = await npcFactory.getActiveNpc(
                message.author.id,
                message.guildId,
            );

            if (activeNPCInGuild !== undefined) {
                if (message.content === 'exit') {
                    await npcFactory.edit(activeNPCInGuild.id, { isActive: false });
                    await message.reply(`Você deixou de ser **${activeNPCInGuild.name}**`);
                    return;
                }

                const webhookClient = new WebhookClient({
                    id: `${activeNPCInGuild.webhookId}`,
                    token: activeNPCInGuild.webhookToken,
                });

                const webhook = await this.client.fetchWebhook(`${activeNPCInGuild.webhookId}`);

                if (webhook.channelId !== message.channelId) {
                    await webhook.edit({
                        channel: message.channelId,
                    });
                }

                await message.delete();
                await webhookClient.send({
                    content: message.content,
                });

                return;
            }

            if (!message.content.startsWith(this.prefix)) {
                return;
            }

            const commandAsList = message.content.split(' ');
            let command = commandAsList[0].toLowerCase();

            command = command.replace(this.prefix, '');
            if (!this.commands[command] && message.content.length > 2) {
                await message.reply(`O comando **${command}** não existe`);
                return;
            }

            try {
                commandAsList.splice(0, 1);
                await this.commands[command].execute(message, commandAsList);
            } catch (e) {
                console.log(e);
                if (e instanceof Error) {
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

    get getClient() {
        return this.client;
    }
}
