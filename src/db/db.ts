import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
config();

const db = drizzle(
    `postgres://${process.env.DATABASE_USER!}:${process.env.DATABASE_PASSWORD!}@${process.env.DATABASE_HOST!}:5432/${process.env.DATABASE!}`,
);

export default db;
