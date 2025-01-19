import { config } from 'dotenv';
import Client from './client';
import NewGen from './commands/inventory/character/newgen';
import Reset from './commands/inventory/character/reset';
import AddExp from './commands/inventory/exp-gold/add-exp';
import { AddGold, RemoveExp, RemoveGold } from './commands/inventory/exp-gold/exp-gold';
import Inventory from './commands/inventory/inventory';
import Buy from './commands/inventory/items/buy';
import { default as CreateItem } from './commands/inventory/items/create-item';
import GiveItem from './commands/inventory/items/give-item';
import Item from './commands/inventory/items/item';
import Pay from './commands/inventory/items/pay';
import Shop from './commands/inventory/items/shop';

config();

const addExp = new AddExp();
const removeExp = new RemoveExp();
const addGold = new AddGold();
const removeGold = new RemoveGold();
const inv = new Inventory();

const pay = new Pay();

const createItem = new CreateItem();
const giveItem = new GiveItem();
const item = new Item();
const shop = new Shop();
const buy = new Buy();

const reset = new Reset();
const newGen = new NewGen();

const client = new Client(';');

client.addCommand([';addexp', ';add-exp'], addExp);
client.addCommand([';removeexp', ';remove-exp'], removeExp);
client.addCommand([';addgold', ';add-gold', ';addmoney', ';add-money'], addGold);
client.addCommand([';removegold', ';remove-gold'], removeGold);
client.addCommand([';inv', ';inventory', ';inventario', ';profile'], inv);

client.addCommand([';pay', ';pagar'], pay);

client.addCommand([';create-item', ';createitem', ';additem', ';add-item'], createItem);
client.addCommand([';give', ';give-item', ';dar-item'], giveItem);
client.addCommand([';item', ';item-info', ';iteminfo', ';view-item'], item);
client.addCommand([';shop', ';loja', ';items'], shop);
client.addCommand([';buy', ';comprar'], buy);

client.addCommand([';reset', ';resetar', ';clear'], reset);
client.addCommand([';newgen', ';resettotal', ';novagen'], newGen);
