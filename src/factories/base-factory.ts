import { InferSelectModel, Table } from 'drizzle-orm';

export default interface Factory<T extends Table> {
    create(...params: Array<unknown>): Promise<InferSelectModel<T>>;

    getByName(...params: Array<unknown>): Promise<InferSelectModel<T>>;

    getAll(...params: Array<unknown>): Promise<Array<InferSelectModel<T>>>;

    delete(id: number): Promise<void>;
}
