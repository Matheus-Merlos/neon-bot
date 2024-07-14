import { Client, IntentsBitField, Events, Message } from 'discord.js';
import play from './commands/music/play';
import skip from './commands/music/skip';
import queue from './commands/music/queue';
import disconnect from './commands/music/disconnect';
import remove from './commands/music/remove';
import dotenv from 'dotenv';
import { App, Command } from './commands/command';
import { Roll } from './commands/rpg/roll';
import StackRoll from './commands/rpg/stackroll';
import { AddGold, AddExp } from './commands/inventory/expgold';
import { StackAddExp, StackAddGold } from './commands/inventory/stackexpgold';
import Inventory from './commands/inventory/inventory';
import UseItem from './commands/inventory/useitem';
import Shop from './commands/inventory/shop';
import ClearChat from './commands/rpg/clearchat';
import NewCharacter from './commands/rpg/newcharacter';
import EditCharacter from './commands/rpg/editcharacter';
import CreateRole from './commands/rpg/roles/createrole';
import AddRole from './commands/rpg/roles/addrole';
import ClearRoles from './commands/rpg/roles/clearroles';
import Ban from './commands/moderation/ban';

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

const app: App = new App();

async function handleCommands(message: Message): Promise<void> {
    if (!message.content.startsWith(prefix)) {
        return;
    }
    const command: string = message.content.split(' ')[0].toLowerCase();

    const BanCommand: Command = new Ban();

    app.addCommand(';ban', BanCommand);

    /*
    commands.push(new Roll(message, [';roll', ';rolar']));
    commands.push(new StackRoll(message, [';stackroll', ';turnos']));
    commands.push(new ClearChat(message, [';limparchat', ';purge', ';limpar-chat', ';clearchat']));
    commands.push(new NewCharacter(message, [';newcharacter', ';novopersonagem']));
    commands.push(new EditCharacter(message, [';editcharacter', ';editar-personagem']));
    commands.push(
        new CreateRole(message, [';createrole', ';criarcargo', ';create-role', ';criar-cargo']),
    );
    commands.push(new AddRole(message, [';addrole', ';add-role', ';adicionar-cargo']));
    commands.push(new ClearRoles(message, [';clearroles', ';limparcargos']));

    commands.push(new AddGold(message, [';addgold', ';add-gold', ';add-money', ';addmoney']));
    commands.push(new AddExp(message, [';addexp', ';add-exp', ';add-xp', ';addxp']));
    commands.push(new StackAddGold(message, [';stackaddgold', ';stack-add-gold']));
    commands.push(new StackAddExp(message, [';stackaddexp', ';stack-add-exp', ';stackaddxp']));

    commands.push(new Inventory(message, [';inv', ';inventario', ';inventory']));
    commands.push(new UseItem(message, [';use-item', ';use', ';useitem', ';usar', ';usaritem']));
    commands.push(new Shop(message, [';shop', ';loja']));
    */

    try {
        app.executeCommand(command, message);
    } catch (e) {
        message.reply('Não existe um comando com essa sintaxe!');
    }
}

if (!token) {
    throw new Error('Auth token not found in environment variables!');
}

client.login(token);
