import { Client, IntentsBitField } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client: Client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

const token: string | undefined = process.env.TOKEN;

if (!token) {
    throw new Error('Auth token not found in environment variables!');
}
client.login(token);
