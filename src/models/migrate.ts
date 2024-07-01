import { migrate } from 'drizzle-orm/postgres-js/migrator';
import db, { connection } from './db';

async function runMigrations() {
    try {
        await migrate(db, { migrationsFolder: './migrations' });

        console.log('Migrações concluídas com sucesso.');

        await connection.end();
        console.log('Conexão com o banco de dados encerrada.');
    } catch (error) {
        console.error('Erro ao executar migrações:', error);
        await connection.end();
    }
}

runMigrations();
