import { config } from 'dotenv';
import Client from './client';
import {
    AddExp,
    AddGold,
    Calculate,
    ClearChat,
    Inventory,
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
import Classes from './commands/class-objectives/classes';
import CompletedClassObjective from './commands/class-objectives/completed-class-objective';
import CompletedClassObjectives from './commands/class-objectives/completed-class-objectives';
import CreateClass from './commands/class-objectives/create-class';
import CreateClassObjective from './commands/class-objectives/create-class-objective';
import DeleteClass from './commands/class-objectives/delete-class';
import SetClass from './commands/class-objectives/set-class';
import Buy from './commands/inventory/items/buy';
import CreateItem from './commands/inventory/items/create-item';
import DeleteItem from './commands/inventory/items/delete-item';
import GiveItem from './commands/inventory/items/give-item';
import Item from './commands/inventory/items/item';
import Shop from './commands/inventory/items/shop';
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

//TODO:
client.addCommand(['create-class', 'criar-classe'], new CreateClass());
client.addCommand(['delete-class', 'deletar-classe'], new DeleteClass());
client.addCommand(['classes', 'class-list'], new Classes());
client.addCommand('set-class', new SetClass());

client.addCommand('create-class-objective', new CreateClassObjective());
client.addCommand('completed-class-objective', new CompletedClassObjective());
client.addCommand('completed-class-objectives', new CompletedClassObjectives());
client.addCommand('class-objectives', new ClassObjectives());

client.addCommand('create-item', new CreateItem());
client.addCommand('delete-item', new DeleteItem());
client.addCommand('give-item', new GiveItem());
client.addCommand(['item', 'item-info', 'view-item'], new Item());
client.addCommand(['shop', 'loja', 'items'], new Shop());
client.addCommand(['buy', 'buy-item'], new Buy());
client.addCommand('use', new Use());

export default client;
