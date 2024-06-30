import { Client, IntentsBitField, Events, Message } from 'discord.js';
import play from './commands/music/play';
import skip from './commands/music/skip';
import queue from './commands/music/queue';
import disconnect from './commands/music/disconnect';
import remove from './commands/music/remove';
import dotenv from 'dotenv';

const prefix = ';';

dotenv.config();

const client: Client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates,
    ],
});

const token: string | undefined = process.env.TOKEN;

client.on(Events.MessageCreate, async (message: Message) => {
    if (!message.content.startsWith(prefix)) {
        return;
    }
    const msg_as_array: Array<string> = message.content.split(' ');

    switch (msg_as_array[0].replace(prefix, '')) {
        case 'play': {
            await play(message);
            break;
        }
        case 'skip': {
            await skip(message);
            break;
        }
        case 'queue': {
            await queue(message);
            break;
        }
        case 'disconnect': {
            await disconnect(message);
            break;
        }
        case 'remove': {
            await remove(message);
            break;
        }
    }
});

if (!token) {
    throw new Error('Auth token not found in environment variables!');
}

client.login(token);
