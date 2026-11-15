import { ChatInputCommandInteraction, Message } from 'discord.js';
import { Column, eq, Table } from 'drizzle-orm';
import { getTableConfig, PgBoolean, PgInteger } from 'drizzle-orm/pg-core';
import db from '../../db/db';
import Factory from '../../factories/base-factory';
import { IStrategy } from '../base-strategy';
import { NpcFactory } from '../../factories/npc-factory';

type TableIdField = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    id: Column<any>;
};

type Input = {
    entryName: string;
    newValue: string;
};

export default class EditFieldStrategy<
    T extends Table,
    U extends Factory<T>,
    V extends T & TableIdField,
> implements IStrategy<Input>
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

    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
        userId?: string,
    ): Promise<void> {
        const { entryName, newValue } = input;

        let entry;
        try {
            if (this.factory instanceof NpcFactory) {
                const uid =
                    userId ??
                    ('author' in replyInstance ? replyInstance.author.id : replyInstance.user.id);
                entry = await this.factory.getByName(entryName, replyInstance.guildId!, uid);
            } else {
                entry = await this.factory.getByName(entryName, replyInstance.guildId!);
            }
        } catch {
            await replyInstance.reply('Não foi encontrado uma entrada válida com este nome.');
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
            await replyInstance.reply(`Erro de validação: ${error.message}`);
            return;
        }

        await db
            .update(this.table)
            .set({
                [this.field]: parsedValue,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any)
            .where(eq(this.table.id, entry.id));

        replyInstance.reply(`${getTableConfig(this.table).name} editado com sucesso!`);
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            entryName: o.getString('item', true),
            newValue: o.getString('value', true),
        };

        await this.handleInput(input, interaction);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
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

        const entryName = match[2].trim();
        const newValue = match[4] || match[5];

        await this.handleInput({ entryName, newValue }, message);
    }
}
