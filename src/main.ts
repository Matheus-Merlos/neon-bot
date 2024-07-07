import { Client, IntentsBitField, Events, Message } from 'discord.js';
import play from './commands/music/play';
import skip from './commands/music/skip';
import queue from './commands/music/queue';
import disconnect from './commands/music/disconnect';
import remove from './commands/music/remove';
import dotenv from 'dotenv';
import Command from './commands/command';
import { Roll } from './commands/rpg/roll';
import StackRoll from './commands/rpg/stackroll';
import { AddGold, AddExp } from './commands/inventory/expgold';
import { StackAddExp, StackAddGold } from './commands/inventory/stackexpgold';
import Inventory from './commands/inventory/inventory';
import UseItem from './commands/inventory/useitem';
import Shop from './commands/inventory/shop';

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

client.on(Events.MessageCreate, handleCommands);

async function handleCommands(message: Message): Promise<void> {
    if (!message.content.startsWith(prefix)) {
        return;
    }
    const command: string = message.content.split(' ')[0].toLowerCase();

    const commands: Array<Command> = [];

    commands.push(new Roll(message, [';roll', ';rolar']));
    commands.push(new StackRoll(message, [';stackroll', ';turnos']));
    commands.push(new AddGold(message, [';addgold', ';add-gold', ';add-money', ';addmoney']));
    commands.push(new AddExp(message, [';addexp', ';add-exp', ';add-xp', ';addxp']));
    commands.push(new StackAddGold(message, [';stackaddgold', ';stack-add-gold']));
    commands.push(new StackAddExp(message, [';stackaddexp', ';stack-add-exp', ';stackaddxp']));
    commands.push(new Inventory(message, [';inv', ';inventario', ';inventory']));

    commands.push(new UseItem(message, [';use-item', ';use', ';useitem', ';usar', ';usaritem']));
    commands.push(new Shop(message, [';shop', ';loja']));

    for (const cmd of commands) {
        if (cmd.commandSyntaxes.includes(command)) {
            cmd.execute();
            return;
        }
    }
    message.reply('Não existe um comando com essa sintaxe');
}

if (!token) {
    throw new Error('Auth token not found in environment variables!');
}

client.login(token);
