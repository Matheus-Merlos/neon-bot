import { config } from 'dotenv';
import Client from './client';
import AddExp from './commands/inventory/inventory';

config();

const addExp = new AddExp();

const client = new Client(';');

client.addCommand([';addexp', ';add-exp'], addExp);
