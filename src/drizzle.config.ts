import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const env = process.env.ENV!;

export default defineConfig({
    out: './drizzle',
    schema: env === 'dev' ? './src/db/schema' : './db/schema',
    dialect: 'postgresql',
    dbCredentials: {
        url: `postgres://${process.env.DATABASE_USER!}:${process.env.DATABASE_PASSWORD!}@${process.env.DATABASE_HOST!}:5432/${process.env.DATABASE!}?sslmode=require`,
    },
});
