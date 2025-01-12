import { config } from 'dotenv';
import Client from './client';
import AddExp from './commands/inventory/exp-gold/add-exp';
import { AddGold, RemoveExp, RemoveGold } from './commands/inventory/exp-gold/exp-gold';

config();

const addExp = new AddExp();
const removeExp = new RemoveExp();
const addGold = new AddGold();
const removeGold = new RemoveGold();

const client = new Client(';');

client.addCommand([';addexp', ';add-exp'], addExp);
client.addCommand([';removeexp', ';remove-exp'], removeExp);
client.addCommand([';addgold', ';add-gold'], addGold);
client.addCommand([';removegold', ';remove-gold'], removeGold);
