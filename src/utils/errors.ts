export class EntryNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EntryNotFoundError';

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, EntryNotFoundError);
        }
    }
}
