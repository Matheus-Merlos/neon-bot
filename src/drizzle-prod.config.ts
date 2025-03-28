import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './db/schema.js',
    dialect: 'postgresql',
    dbCredentials: {
        url: `postgres://${process.env.DATABASE_USER!}:${process.env.DATABASE_PASSWORD!}@${process.env.DATABASE_HOST!}:5432/${process.env.DATABASE!}`,
    },
});
