import { config } from 'dotenv';
import Client from './client';
import AddExp from './commands/inventory/exp-gold/add-exp';
import { AddGold, RemoveExp, RemoveGold } from './commands/inventory/exp-gold/exp-gold';
import Inventory from './commands/inventory/inventory';
import { default as CreateItem } from './commands/inventory/items/create-item';
import Item from './commands/inventory/items/item';
import Pay from './commands/inventory/pay';

config();

const addExp = new AddExp();
const removeExp = new RemoveExp();
const addGold = new AddGold();
const removeGold = new RemoveGold();
const inv = new Inventory();

const pay = new Pay();

const createItem = new CreateItem();
const item = new Item();

const client = new Client(';');

client.addCommand([';addexp', ';add-exp'], addExp);
client.addCommand([';removeexp', ';remove-exp'], removeExp);
client.addCommand([';addgold', ';add-gold', ';addmoney', ';add-money'], addGold);
client.addCommand([';removegold', ';remove-gold'], removeGold);
client.addCommand([';inv', ';inventory'], inv);

client.addCommand([';pay', ';pagar'], pay);

client.addCommand([';create-item', ';createitem', ';additem', ';add-item'], createItem);
client.addCommand([';item', ';item-info', ';iteminfo', ';view-item'], item);
