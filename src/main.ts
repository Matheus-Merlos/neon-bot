import { config } from 'dotenv';
import { default as Client } from './client';
import ClassObjectives from './commands/class-objectives/class-objectives';
import Classes from './commands/class-objectives/classes';
import CompletedClassObjective from './commands/class-objectives/completed-class-objective';
import CompletedClassObjectives from './commands/class-objectives/completed-class-objectives';
import CreateClass from './commands/class-objectives/create-class';
import CreateClassObjective from './commands/class-objectives/create-class-objective';
import DeleteClass from './commands/class-objectives/delete-class';
import SetClass from './commands/class-objectives/set-class';
import NewGen from './commands/inventory/character/newgen';
import Reset from './commands/inventory/character/reset';
import AddExp from './commands/inventory/exp-gold/add-exp';
import { AddGold, RemoveExp, RemoveGold } from './commands/inventory/exp-gold/exp-gold';
import StackAddExp from './commands/inventory/exp-gold/stack-add-exp';
import { default as StackAddGold } from './commands/inventory/exp-gold/stack-add-gold';
import Inventory from './commands/inventory/inventory';
import Buy from './commands/inventory/items/buy';
import { default as CreateItem } from './commands/inventory/items/create-item';
import { default as DeleteItem } from './commands/inventory/items/delete-item';
import GiveItem from './commands/inventory/items/give-item';
import Item from './commands/inventory/items/item';
import Pay from './commands/inventory/items/pay';
import Shop from './commands/inventory/items/shop';
import Use from './commands/inventory/items/use';
import Leaderboard from './commands/inventory/leaderboard';
import CreateMission from './commands/missions/create-mission';
import CreateMissionDifficulty from './commands/missions/create-mission-difficulty';
import DeleteMission from './commands/missions/delete-mission';
import DeleteMissionDifficulty from './commands/missions/delete-mission-difficulty';
import Mission from './commands/missions/mission';
import MissionDifficulties from './commands/missions/mission-difficulties';
import SelectObjective from './commands/objectives/choose-objective';
import CompletedObjective from './commands/objectives/completed-objective';
import CompletedObjectives from './commands/objectives/completed-objectives';
import CreateObjective from './commands/objectives/create-objective';
import CreateObjectiveDifficulty from './commands/objectives/create-objective-difficulty';
import DeleteObjective from './commands/objectives/delete-objective';
import Objectives from './commands/objectives/objectives';
import SelectedObjectives from './commands/objectives/selected-objectives';
import Calculate from './commands/rpg/calculate';
import ClearChat from './commands/rpg/clear-chat';
import Roll from './commands/rpg/roll';
import { default as TurnList } from './commands/rpg/turn-list';

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

client.addCommand('create-item', new CreateItem());
client.addCommand('delete-item', new DeleteItem());
client.addCommand('give-item', new GiveItem());
client.addCommand(['item', 'item-info', 'view-item'], new Item());
client.addCommand(['shop', 'loja', 'items'], new Shop());
client.addCommand(['buy', 'buy-item'], new Buy());
client.addCommand('use', new Use());

client.addCommand(['reset', 'clear'], new Reset());
client.addCommand(['newgen', 'novagen'], new NewGen());

client.addCommand(['coj', 'create-objective-difficulty'], new CreateObjectiveDifficulty());
client.addCommand('create-objective', new CreateObjective());
client.addCommand('delete-objective', new DeleteObjective());

client.addCommand('objectives', new Objectives());
client.addCommand(['choose-objective', 'select-objective'], new SelectObjective());
client.addCommand('completed-objective', new CompletedObjective());
client.addCommand('completed-objectives', new CompletedObjectives());
client.addCommand('selected-objectives', new SelectedObjectives());

client.addCommand(['create-class', 'criar-classe'], new CreateClass());
client.addCommand(['delete-class', 'deletar-classe'], new DeleteClass());
client.addCommand(['classes', 'class-list'], new Classes());
client.addCommand('set-class', new SetClass());

client.addCommand('create-class-objective', new CreateClassObjective());
client.addCommand('completed-class-objective', new CompletedClassObjective());
client.addCommand('completed-class-objectives', new CompletedClassObjectives());
client.addCommand('class-objectives', new ClassObjectives());

client.addCommand(['turn-list', 'turnos'], new TurnList());
client.addCommand(['calc', 'r', 'calculate'], new Calculate());
client.addCommand('roll', new Roll());
client.addCommand(['limpar-chat', 'clear-chat'], new ClearChat());

client.addCommand('create-mission-difficulty', new CreateMissionDifficulty());
client.addCommand('delete-mission-difficulty', new DeleteMissionDifficulty());
client.addCommand('mission-difficulties', new MissionDifficulties());
client.addCommand('create-mission', new CreateMission());
client.addCommand('delete-mission', new DeleteMission());
client.addCommand('mission', new Mission());

export default client;
