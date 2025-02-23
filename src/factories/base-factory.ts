import { InferSelectModel, Table } from 'drizzle-orm';
import getMostSimilarString from '../utils/levenshtein';

export default abstract class Factory<T extends Table> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getInstance(): Factory<any> {
        throw new Error('Static method getInstance() must be implemented in the sublcass.');
    }

    abstract create(...params: Array<unknown>): Promise<InferSelectModel<T>>;

    abstract getByName(...params: Array<unknown>): Promise<InferSelectModel<T>>;

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
