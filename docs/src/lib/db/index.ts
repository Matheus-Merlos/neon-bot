import Database from 'better-sqlite3';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/better-sqlite3';
config();
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = new Database(process.env.DATABASE_URL);
export const db = drizzle(client);
