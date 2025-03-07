/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColorResolvable, EmbedBuilder, Message } from 'discord.js';
import { InferSelectModel, Table } from 'drizzle-orm';
import Factory from '../factories/base-factory';
import ShowEmbed from '../factories/show-embed';
import { CreateStrategy, DefaultStrategy, DeleteStrategy, ListStrategy, Strategy } from '../strategies';
import embedList from '../utils/embed-list';
import { EntryNotFoundError } from '../utils/errors';

export default interface Command {
    execute(message: Message, messageAsList: Array<string>): Promise<void>;
}

export abstract class InfoCommand implements Command {
    constructor(
        protected readonly factoryInstance: Factory<any> & ShowEmbed<any>,
        protected readonly entryName: string,
        protected readonly isFeminineWord: boolean = false,
    ) {}

    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
        const entryName = messageAsList.join(' ').trim();

        let entry;

        try {
            entry = await this.factoryInstance.getByName(entryName, message.guildId!);
        } catch (e) {
            if (e instanceof EntryNotFoundError)
                await message.reply(
                    `Não foi encontrado ${this.isFeminineWord ? 'uma' : 'um'} ${this.entryName} com o nome **${entryName}**.`,
                );
            return;
        }

        await message.reply({ embeds: [this.factoryInstance.show(entry)] });
    }
}

type EmbedField = {
    name: string;
    value: string;
    inline?: boolean;
};

export abstract class ListCommand<T extends Table> implements Command {
    constructor(
        protected readonly factoryInstance: Factory<T>,
        protected readonly listName: string,
        protected readonly embedColor: ColorResolvable,
        protected readonly fieldCallbackFn: (
            entry: InferSelectModel<T>,
        ) => EmbedField | Array<EmbedField> | Promise<EmbedField> | Promise<Array<EmbedField>>,
    ) {}

    async execute(message: Message): Promise<void> {
        const entries = await this.factoryInstance.getAll(message.guildId!);

        await embedList(entries, 5, message, async (matrix: Array<typeof entries>, currentIndex: number) => {
            const embed = new EmbedBuilder()
                .setTitle(this.listName)
                .setColor(this.embedColor)
                .setFooter({ text: `Página ${currentIndex + 1}/${matrix.length}` });

            const entries = matrix[currentIndex];

            for (const entry of entries) {
                const fields = await this.fieldCallbackFn(entry);
                const fieldsArray = Array.isArray(fields) ? fields : [fields];
                embed.addFields(...fieldsArray);
            }

            return embed;
        });
    }
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
