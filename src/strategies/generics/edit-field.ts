import { Message } from 'discord.js';
import { Column, eq, Table } from 'drizzle-orm';
import { getTableConfig, PgBoolean, PgInteger } from 'drizzle-orm/pg-core';
import db from '../../db/db';
import Factory from '../../factories/base-factory';
import Strategy from '../base-strategy';
import { NpcFactory } from '../../factories/npc-factory';

type TableIdField = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    id: Column<any>;
};

export default class EditFieldStrategy<
    T extends Table,
    U extends Factory<T>,
    V extends T & TableIdField,
> implements Strategy
{
    constructor(
        private readonly table: V,
        private readonly factory: U,
        private readonly field: keyof V['_']['columns'] & string,
    ) {}

    private parseValue(column: Column, value: string): string | number | boolean | Date {
        if (column instanceof PgInteger) {
            const num = parseInt(value, 10);
            if (isNaN(num)) throw new Error(`O valor '${value}' não é um número válido.`);
            return num;
        }

        if (column instanceof PgBoolean) {
            if (['true', 't', '1', 'sim', 's'].includes(value.toLowerCase())) return true;
            if (['false', 'f', '0', 'não', 'nao', 'n'].includes(value.toLowerCase())) return false;
            throw new Error(`O valor '${value}' não é um booleano válido.`);
        }

        return value;
    }

    private camelToSnakeCase(str: string): string {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        //Pega a mensagem tirando apenas o comando base ";item" (servirá para o regex)
        const messageContent = message.content.split(' ');
        messageContent.splice(0, 1);
        const messageContentWithoutCommand = messageContent.join(' ');

        const regex = /^edit\s+(\S+)\s+(.+?)\s+("([^"]+)"|(\S+))$/;

        const match = messageContentWithoutCommand.match(regex);
        if (!match) {
            await message.reply(
                'Formato inválido! A mensagem deve ser sempre: `edit <campo> <Nome(SEM ASPAS)> <Valor Novo(COM ASPAS)`',
            );
            return;
        }

        const name = match[2].trim();
        const newValue = match[4] || match[5];

        let entry;
        try {
            if (this.factory instanceof NpcFactory)
                entry = await this.factory.getByName(name, message.guildId, message.author.id);
            else entry = await this.factory.getByName(name, message.guildId);
        } catch {
            await message.reply('Não foi encontrado uma entrada válida com este nome.');
            return;
        }

        let parsedValue;
        try {
            const tableConfig = getTableConfig(this.table);
            const columnDefinition = tableConfig.columns.find(
                (c) => c.name === this.camelToSnakeCase(this.field),
            );
            if (!columnDefinition) {
                throw new Error(
                    `A coluna '${this.field}' não foi encontrada na tabela. Verifique o nome do campo.`,
                );
            }
            parsedValue = this.parseValue(columnDefinition, newValue);
        } catch (error: unknown) {
            if (!(error instanceof Error)) {
                return;
            }
            await message.reply(`Erro de validação: ${error.message}`);
            return;
        }

        await db
            .update(this.table)
            .set({
                [this.field]: parsedValue,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any)
            .where(eq(this.table.id, entry.id));

        message.reply(`${getTableConfig(this.table).name} editado com sucesso!`);
    }
}
