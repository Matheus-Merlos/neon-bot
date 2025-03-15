import { config } from 'dotenv';
import Client from './client';
import {
    AddExp,
    AddGold,
    Calculate,
    Character,
    Class,
    ClassObjective,
    ClearChat,
    Image,
    Inventory,
    Item,
    Leaderboard,
    Mission,
    MissionDifficulty,
    NewGen,
    Objective,
    ObjectiveDifficulty,
    Pay,
    RemoveExp,
    RemoveGold,
    Reset,
    Roll,
    StackAddExp,
    StackAddGold,
    TurnList,
} from './commands';
config();

const client = new Client(';');

client.addCommand('add-exp', new AddExp());
client.addCommand('remove-exp', new RemoveExp());
client.addCommand(['add-gold', 'add-money'], new AddGold());
client.addCommand('remove-gold', new RemoveGold());
client.addCommand('stack-add-exp', new StackAddExp());
client.addCommand('stack-add-gold', new StackAddGold());
client.addCommand(['inv', 'inventory', 'profile'], new Inventory());
client.addCommand('leaderboard', new Leaderboard());
client.addCommand(['pay', 'pagar'], new Pay());

client.addCommand(['reset', 'clear'], new Reset());
client.addCommand(['newgen', 'novagen'], new NewGen());

client.addCommand(['turn-list', 'turnos'], new TurnList());
client.addCommand(['calc', 'r', 'calculate'], new Calculate());
client.addCommand('roll', new Roll());
client.addCommand(['limpar-chat', 'clear-chat'], new ClearChat());

client.addCommand('objective', new Objective());
client.addCommand('objective-difficulty', new ObjectiveDifficulty());

client.addCommand('mission', new Mission());
client.addCommand('mission-difficulty', new MissionDifficulty());

client.addCommand('class', new Class());

client.addCommand('item', new Item());

client.addCommand('class-objective', new ClassObjective());

client.addCommand('character', new Character());

client.addCommand('img', new Image());

export default client;
