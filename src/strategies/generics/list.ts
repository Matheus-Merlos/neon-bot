import {
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    EmbedField,
    Message,
} from 'discord.js';
import { InferSelectModel, Table } from 'drizzle-orm';
import Factory from '../../factories/base-factory';
import embedList from '../../utils/embed-list';
import Strategy, { IStrategy } from '../base-strategy';

export default class ListStrategy<T extends Table> implements IStrategy<{}> {
    constructor(
        protected readonly factoryInstance: Factory<T>,
        protected readonly listName: string,
        protected readonly embedColor: ColorResolvable,
        protected readonly fieldCallbackFn: (
            entry: InferSelectModel<T>,
        ) => EmbedField | Array<EmbedField> | Promise<EmbedField> | Promise<Array<EmbedField>>,
        protected readonly itemsPerPage = 5,
    ) {}
    async handleInput(
        input: {},
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const entries = await this.factoryInstance.getAll(replyInstance.guildId!);

        if (entries.length === 0) {
            await replyInstance.reply('Nenhum registro encontrado no servidor.');
            return;
        }

        await embedList(
            entries,
            this.itemsPerPage,
            replyInstance,
            async (matrix: Array<typeof entries>, currentIndex: number) => {
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
            },
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        await this.handleInput({}, interaction);
    }

    async execute(message: Message<true>): Promise<void> {
        await this.handleInput({}, message);
    }
}
