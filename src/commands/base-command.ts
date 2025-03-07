import { ColorResolvable, Message } from 'discord.js';
import { Table } from 'drizzle-orm';
import Factory from '../factories/base-factory';
import { CreateStrategy, DefaultStrategy, DeleteStrategy, ListStrategy, Strategy } from '../strategies';

export default interface Command {
    execute(message: Message, messageAsList: Array<string>): Promise<void>;
}

export abstract class StrategyCommand implements Command {
    constructor(
        private readonly commandName: string,
        private readonly subCommands: Record<string, Strategy> = {},
        private readonly defaultStrategy: DefaultStrategy | null = null,
    ) {
        if (defaultStrategy === null) {
            this.defaultStrategy = new DefaultStrategy(this.commandName, [
                { name: 'Erro', description: 'Este comando não possui subcomandos' },
            ]);
        }
    }

    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const subCommand = messageAsList.splice(0, 1)[0];

        const strategy: Strategy = this.subCommands[subCommand] ?? this.defaultStrategy;

        await strategy.execute(message as Message<true>, messageAsList);
    }
}

export abstract class SimpleTableCommand<T extends Table, U extends Factory<T>> extends StrategyCommand {
    constructor(
        commandName: string,
        factoryInstance: U,
        embedColor: ColorResolvable,
        entityName: string,
        extraSubcommands: Record<string, Strategy> = {},
    ) {
        super(commandName, {
            ...{
                create: new CreateStrategy(factoryInstance, entityName),
                list: new ListStrategy(factoryInstance, entityName, embedColor, (entry) => {
                    return [
                        {
                            name: `${entry.name}`,
                            value: ' ',
                            inline: false,
                        },
                        {
                            name: ' ',
                            value: ' ',
                            inline: false,
                        },
                    ];
                }),
                delete: new DeleteStrategy(factoryInstance, entityName),
            },
            ...extraSubcommands,
        });
    }
}
