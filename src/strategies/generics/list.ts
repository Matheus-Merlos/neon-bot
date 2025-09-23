import { ColorResolvable, EmbedBuilder, EmbedField, Message } from 'discord.js';
import { InferSelectModel, Table } from 'drizzle-orm';
import Factory from '../../factories/base-factory';
import embedList from '../../utils/embed-list';
import Strategy from '../base-strategy';

export default class ListStrategy<T extends Table> implements Strategy {
    constructor(
        protected readonly factoryInstance: Factory<T>,
        protected readonly listName: string,
        protected readonly embedColor: ColorResolvable,
        protected readonly fieldCallbackFn: (
            entry: InferSelectModel<T>,
        ) => EmbedField | Array<EmbedField> | Promise<EmbedField> | Promise<Array<EmbedField>>,
        protected readonly itemsPerPage = 5,
    ) {}

    async execute(message: Message): Promise<void> {
        const entries = await this.factoryInstance.getAll(message.guildId!);

        if (entries.length === 0) {
            await message.reply('Nenhum registro encontrado no servidor.');
            return;
        }

        await embedList(entries, this.itemsPerPage, message, async (matrix: Array<typeof entries>, currentIndex: number) => {
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
