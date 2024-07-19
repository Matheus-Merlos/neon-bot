//An Element represents any object that represents a entry in the database (Factory Method Design Pattern)

export interface Element {
    update(): Promise<void>;
}
