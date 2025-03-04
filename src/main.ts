import { config } from 'dotenv';
import { default as Client } from './client';
import Objective from './commands/objectives/objective';

config();

const client = new Client(';');

//client.addCommand('add-exp', new AddExp());
//client.addCommand('remove-exp', new RemoveExp());
//client.addCommand(['add-gold', 'add-money'], new AddGold());
//client.addCommand('remove-gold', new RemoveGold());
//client.addCommand('stack-add-exp', new StackAddExp());
//client.addCommand('stack-add-gold', new StackAddGold());
//client.addCommand(['inv', 'inventory', 'profile'], new Inventory());
//client.addCommand('leaderboard', new Leaderboard());
//client.addCommand(['pay', 'pagar'], new Pay());

//client.addCommand('create-item', new CreateItem());
//client.addCommand('delete-item', new DeleteItem());
//client.addCommand('give-item', new GiveItem());
//client.addCommand(['item', 'item-info', 'view-item'], new Item());
//client.addCommand(['shop', 'loja', 'items'], new Shop());
//client.addCommand(['buy', 'buy-item'], new Buy());
//client.addCommand('use', new Use());

//client.addCommand(['reset', 'clear'], new Reset());
//client.addCommand(['newgen', 'novagen'], new NewGen());

//client.addCommand(['coj', 'create-objective-difficulty'], new CreateObjectiveDifficulty());
//client.addCommand(['choose-objective', 'select-objective'], new SelectObjective());
//client.addCommand('completed-objective', new CompletedObjective());
//client.addCommand('completed-objectives', new CompletedObjectives());
//client.addCommand('selected-objectives', new SelectedObjectives());

//client.addCommand(['create-class', 'criar-classe'], new CreateClass());
//client.addCommand(['delete-class', 'deletar-classe'], new DeleteClass());
//client.addCommand(['classes', 'class-list'], new Classes());
//client.addCommand('set-class', new SetClass());

//client.addCommand('create-class-objective', new CreateClassObjective());
//client.addCommand('completed-class-objective', new CompletedClassObjective());
//client.addCommand('completed-class-objectives', new CompletedClassObjectives());
//client.addCommand('class-objectives', new ClassObjectives());

//client.addCommand(['turn-list', 'turnos'], new TurnList());
//client.addCommand(['calc', 'r', 'calculate'], new Calculate());
//client.addCommand('roll', new Roll());
//client.addCommand(['limpar-chat', 'clear-chat'], new ClearChat());

//client.addCommand('create-mission-difficulty', new CreateMissionDifficulty());
//client.addCommand('delete-mission-difficulty', new DeleteMissionDifficulty());
//client.addCommand('mission-difficulties', new MissionDifficulties());
//client.addCommand('create-mission', new CreateMission());
//client.addCommand('delete-mission', new DeleteMission());
//client.addCommand('mission', new Mission());
//client.addCommand('completed-mission', new CompletedMission());
//client.addCommand('missions', new Missions());

client.addCommand('objective', new Objective());

export default client;
