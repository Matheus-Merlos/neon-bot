import { Column, eq, InferInsertModel, InferSelectModel, Table } from 'drizzle-orm';
import db from '../db/db';

export default abstract class Product<T extends Table> {
    constructor(
        protected readonly tableInstance: T,
        protected readonly primaryKey: keyof InferSelectModel<T> & string,
        protected readonly productArgs: InferInsertModel<T>,
    ) {}

    async update(): Promise<void> {
        await db
            .update(this.tableInstance)
            .set(this.productArgs)
            .where(
                eq(
                    this.tableInstance[this.primaryKey as keyof T] as Column,
                    this.productArgs[this.primaryKey as keyof typeof this.productArgs],
                ),
            );
    }
}
