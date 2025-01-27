import { InferSelectModel, Table } from 'drizzle-orm';
import getMostSimilarString from '../utils/levenshtein';

export default abstract class Factory<T extends Table> {
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
            [searchColumn]: entry[searchColumn].toLowerCase(),
        }));

        const desiredEntryName = getMostSimilarString(
            entryListLowerCase.map((entry) => entry[searchColumn]!),
            searchName,
        );

        const desiredEntryNameId = entryList.find((entry) => entry[searchColumn] === desiredEntryName)!.id;

        const entry = entryList.find((entry) => entry.id === desiredEntryNameId)!.id;

        return entry!;
    }

    abstract getAll(...params: Array<unknown>): Promise<Array<InferSelectModel<T>>>;

    abstract delete(id: number): Promise<void>;
}
