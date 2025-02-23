import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
config();

const client = createClient({ url: process.env.DB_FILE_NAME! });
const db = drizzle({ client });

export default db;
