import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
config();

const db = drizzle(
    `postgres://${process.env.DATABASE_USER!}:${process.env.DATABASE_PASSWORD!}@${process.env.DATABASE_HOST!}/${process.env.DATABASE!}?sslmode=require`,
);

export default db;
