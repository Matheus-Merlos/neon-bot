import { config } from 'dotenv';
import Client from './client';
import {
    AddExp,
    AddGold,
    Calculate,
    Class,
    ClearChat,
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
import ClassObjectives from './commands/class-objectives/class-objectives';
import CompletedClassObjective from './commands/class-objectives/completed-class-objective';
import CompletedClassObjectives from './commands/class-objectives/completed-class-objectives';
import CreateClassObjective from './commands/class-objectives/create-class-objective';
import Buy from './commands/inventory/items/buy';
import { default as GiveItem } from './commands/inventory/items/give-item';
import Use from './commands/inventory/items/use';

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

//TODO:
client.addCommand('create-class-objective', new CreateClassObjective());
client.addCommand('completed-class-objective', new CompletedClassObjective());
client.addCommand('completed-class-objectives', new CompletedClassObjectives());
client.addCommand('class-objectives', new ClassObjectives());

client.addCommand('give-item', new GiveItem());
client.addCommand(['buy', 'buy-item'], new Buy());
client.addCommand('use', new Use());

export default client;
