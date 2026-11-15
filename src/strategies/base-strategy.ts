import { ChatInputCommandInteraction, Message } from 'discord.js';
import DefaultStrategy from './generics/default';

export default interface Strategy {
    execute(message: Message<true>, messageAsList: Array<string>): Promise<void>;
}

// Temporary interface for slash command implementation
export interface IStrategy<T> {
    execute(message: Message<true>, messageAsList: Array<string>): Promise<void>;

    handleInput(
        input: T,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void>;

    executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void>;
}

export class SuperStrategy implements Strategy {
    constructor(
        private readonly commandName: string,
        private readonly subCommands: Record<string, Strategy> = {},
        private readonly defaultStrategy: DefaultStrategy | null = null,
    ) {
        if (defaultStrategy === null) {
            this.defaultStrategy = new DefaultStrategy(this.commandName, {
                Erro: 'Este comando não possui subcomandos',
            });
        }
    }

    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const subCommand = messageAsList.splice(0, 1)[0];

        const strategy: Strategy = this.subCommands[subCommand] ?? this.defaultStrategy;

        await strategy.execute(message as Message<true>, messageAsList);
    }
}
