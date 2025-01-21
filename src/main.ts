import { config } from 'dotenv';
import { default as Client } from './client';
import Classes from './commands/class-objectives/classes';
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
import SelectObjective from './commands/objectives/choose-objective';
import CompletedObjective from './commands/objectives/completed-objective';
import CompletedObjectives from './commands/objectives/completed-objectives';
import CreateObjective from './commands/objectives/create-objective';
import CreateObjectiveDifficulty from './commands/objectives/create-objective-difficulty';
import DeleteObjective from './commands/objectives/delete-objective';
import Objectives from './commands/objectives/objectives';
import SelectedObjectives from './commands/objectives/selected-objectives';

config();

const addExp = new AddExp();
const removeExp = new RemoveExp();
const addGold = new AddGold();
const removeGold = new RemoveGold();
const stackAddExp = new StackAddExp();
const stackAddGold = new StackAddGold();
const inv = new Inventory();

const pay = new Pay();

const createItem = new CreateItem();
const deleteItem = new DeleteItem();
const giveItem = new GiveItem();
const item = new Item();
const shop = new Shop();
const buy = new Buy();
const use = new Use();

const reset = new Reset();
const newGen = new NewGen();

const createObjectiveDifficulty = new CreateObjectiveDifficulty();
const createObjective = new CreateObjective();
const deleteObjective = new DeleteObjective();

const objectives = new Objectives();

const client = new Client(';');

client.addCommand([';addexp', ';add-exp'], addExp);
client.addCommand([';removeexp', ';remove-exp'], removeExp);
client.addCommand([';addgold', ';add-gold', ';addmoney', ';add-money'], addGold);
client.addCommand([';removegold', ';remove-gold'], removeGold);
client.addCommand([';stackaddexp', ';stack-add-exp'], stackAddExp);
client.addCommand([';stackaddgold', ';stack-add-gold'], stackAddGold);
client.addCommand([';inv', ';inventory', ';inventario', ';profile'], inv);

client.addCommand([';pay', ';pagar'], pay);

client.addCommand([';create-item', ';createitem', ';additem', ';add-item'], createItem);
client.addCommand([';delete-item', ';deleteitem'], deleteItem);
client.addCommand([';give', ';give-item', ';dar-item'], giveItem);
client.addCommand([';item', ';item-info', ';iteminfo', ';view-item'], item);
client.addCommand([';shop', ';loja', ';items'], shop);
client.addCommand([';buy', ';comprar'], buy);
client.addCommand([';use', ';usar'], use);

client.addCommand([';reset', ';resetar', ';clear'], reset);
client.addCommand([';newgen', ';resettotal', ';novagen'], newGen);

client.addCommand([';createobjectivedifficulty', ';coj', ';cdo', ';create-objective-difficulty'], createObjectiveDifficulty);
client.addCommand([';createobjective', ';create-objective', ';criarobjetivo'], createObjective);
client.addCommand([';deleteobjective', ';delete-objective', ';deletarobjetivo'], deleteObjective);

client.addCommand([';objectives', ';objetivos'], objectives);
client.addCommand([';chooseobjective', ';choose-objective', ';escolherobjetivo'], new SelectObjective());
client.addCommand([';completed-objective', ';completedobjective', ';objetivoconcluído'], new CompletedObjective());
client.addCommand([';completed-objectives', ';completedobjectives', ';objetivosconcluidos'], new CompletedObjectives());
client.addCommand([';selected-objectives', ';selectedobjectives', ';objetivosselecionados'], new SelectedObjectives());

client.addCommand([';createclass', ';create-class', ';criar-classe', ';criarclasse'], new CreateClass());
client.addCommand([';delete-class', ';deleteclass', ';deletar-classe'], new DeleteClass());
client.addCommand([';classes', ';class-list'], new Classes());
client.addCommand([';set-class', ';setclass'], new SetClass());

client.addCommand([';create-class-objective', ';criar-objetivo-classe'], new CreateClassObjective());
