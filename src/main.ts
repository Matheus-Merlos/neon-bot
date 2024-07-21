import { Client, IntentsBitField, Events, Message } from 'discord.js';
import dotenv from 'dotenv';
import { App, Command } from './commands/command';
import { Roll } from './commands/rpg/roll';
import StackRoll from './commands/rpg/stackroll';
import { AddGold, RemoveExp, RemoveGold } from './commands/inventory/expgold';
import { AddExp } from './commands/inventory/expgold';
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
import AudioPlayer from './commands/music/audio-player';
import { Disconnect } from './commands/music/disconnect';
import { Play } from './commands/music/play';
import { SongQueue } from './commands/music/queue';
import { Remove } from './commands/music/remove';
import { Skip } from './commands/music/skip';
import Pay from './commands/inventory/pay';
import NewGeneration from './commands/inventory/newgeneration';
import CreateRank from './commands/inventory/ranks/createrank';

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

const audioPlayer: AudioPlayer = new AudioPlayer();
const playCommand: Command = new Play(audioPlayer);
const queueCommand: Command = new SongQueue(audioPlayer);
const removeSongCommand: Command = new Remove(audioPlayer);
const skipCommand: Command = new Skip(audioPlayer);
const disconnectCommand: Command = new Disconnect(audioPlayer);

const banCommand: Command = new Ban();

const rollCommand: Command = new Roll();
const stackRollCommand: Command = new StackRoll();
const clearChatCommand: Command = new ClearChat();
const newCharacterCommand: Command = new NewCharacter();
const editCharacterCommand: Command = new EditCharacter();

const createRole: Command = new CreateRole();
const addRoleCommand: Command = new AddRole();
const clearRolesCommand: Command = new ClearRoles();

const addGoldCommand = new AddGold();
const addExpCommand = new AddExp();
const removeGoldCommand = new RemoveGold();
const removeExpCommand = new RemoveExp();

const stackAddGoldCommand = new StackAddGold();
const stackAddExpCommand = new StackAddExp();

const inventoryCommand: Command = new Inventory();
const useItemCommand: Command = new UseItem();
const shopCommand: Command = new Shop();
const payCommand: Command = new Pay();

const newGenCommand: Command = new NewGeneration();

const createRankCommand: Command = new CreateRank();

const app: App = new App();

app.addCommand(';play', playCommand);
app.addCommand([';queue', ';fila'], queueCommand);
app.addCommand(';disconnect', disconnectCommand);
app.addCommand(';remove', removeSongCommand);
app.addCommand(';skip', skipCommand);

app.addCommand(';ban', banCommand);

app.addCommand(';roll', rollCommand);
app.addCommand(';stackroll', stackRollCommand);
app.addCommand([';clearchat', ';limparchat'], clearChatCommand);
app.addCommand([';newcharacter', ';novopersonagem'], newCharacterCommand);
app.addCommand([';editcharacter', ';editarpersonagem'], editCharacterCommand);

app.addCommand(';createrole', createRole);
app.addCommand(';addrole', addRoleCommand);
app.addCommand(';clearroles', clearRolesCommand);

app.addCommand([';addgold', ';add-gold', ';add-money', ';addmoney'], addGoldCommand);
app.addCommand([';addexp', ';add-exp', ';add-xp', ';addxp'], addExpCommand);
app.addCommand([';removegold', ';remove-gold', ';remove-money', ';removemoney'], removeGoldCommand);
app.addCommand([';removeexp', ';remove-exp', ';remove-xp'], removeExpCommand);

app.addCommand([';stackaddgold', ';stack-add-gold'], stackAddGoldCommand);
app.addCommand([';stackaddexp', ';stack-add-exp', ';stackaddxp'], stackAddExpCommand);

app.addCommand([';inv', ';inventory', ';inventario'], inventoryCommand);
app.addCommand([';use-item', ';use', ';useitem', ';usar', ';usaritem'], useItemCommand);
app.addCommand(';shop', shopCommand);
app.addCommand(';pay', payCommand);
app.addCommand([';novagen', ';newgen'], newGenCommand);

app.addCommand([';createrank', ';criar-rank'], createRankCommand);

async function handleCommands(message: Message): Promise<void> {
    if (!message.content.startsWith(prefix)) {
        return;
    }
    const command: string = message.content.split(' ')[0].toLowerCase();

    try {
        await app.executeCommand(command, message);
    } catch (e) {
        console.log(e);
        message.reply('Não existe um comando com essa sintaxe!');
    }
}

if (!token) {
    throw new Error('Auth token not found in environment variables!');
}

client.login(token);
