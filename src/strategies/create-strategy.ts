import { InferInsertModel, InferSelectModel, Table } from 'drizzle-orm';
import db from '../db/db';

export default class CreateStrategy<T extends Table> {
    constructor(protected readonly table: T) {}
    async create(args: InferInsertModel<T>): Promise<InferSelectModel<T>> {
        const [createdIndex] = (await db.insert(this.table).values(args).returning()) as InferSelectModel<T>[];

        return createdIndex;
    }
}
