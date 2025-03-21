import { InferInsertModel, InferSelectModel, Table } from 'drizzle-orm';
import db from '../db/db';
import getMostSimilarString from '../utils/levenshtein';

export default abstract class Factory<T extends Table> {
    constructor(protected readonly table: T) {}

    async create(args: InferInsertModel<T>): Promise<InferSelectModel<T>> {
        const [createdIndex] = (await db.insert(this.table).values(args).returning()) as InferSelectModel<T>[];

        return createdIndex;
    }

    abstract getByName(name: string, guildId: string): Promise<InferSelectModel<T>>;

    protected searchEntry(
        entries: Array<InferSelectModel<T>>,
        searchColumn: keyof InferSelectModel<T>,
        searchName: string,
    ): InferSelectModel<T> {
        const entryList = [...entries];

        const entryListLowerCase = entries.map((entry) => ({
            ...entry,
            [searchColumn]: (entry[searchColumn] as string).toLowerCase(),
        }));

        const desiredEntryName = getMostSimilarString(
            entryListLowerCase.map((entry) => entry[searchColumn] as string),
            searchName,
        );

        const desiredEntryNameId = entryList.find(
            (entry) => (entry[searchColumn] as string).toLowerCase() === desiredEntryName,
        )!.id;

        const entry = entryList.find((entry) => entry.id === desiredEntryNameId);

        return entry!;
    }

    abstract getAll(...params: Array<unknown>): Promise<Array<InferSelectModel<T>>>;

    abstract delete(id: number): Promise<void>;
}
