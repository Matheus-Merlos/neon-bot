import { config } from 'dotenv';
import Client from './client';
import AddExp from './commands/inventory/exp-gold/add-exp';
import { AddGold, RemoveExp, RemoveGold } from './commands/inventory/exp-gold/exp-gold';
import Inventory from './commands/inventory/inventory';

config();

const addExp = new AddExp();
const removeExp = new RemoveExp();
const addGold = new AddGold();
const removeGold = new RemoveGold();
const inv = new Inventory();

const client = new Client(';');

client.addCommand([';addexp', ';add-exp'], addExp);
client.addCommand([';removeexp', ';remove-exp'], removeExp);
client.addCommand([';addgold', ';add-gold'], addGold);
client.addCommand([';removegold', ';remove-gold'], removeGold);
client.addCommand([';inv', ';inventory'], inv);
