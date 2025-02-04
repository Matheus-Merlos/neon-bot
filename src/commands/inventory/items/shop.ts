import { Colors, EmbedBuilder, Message } from 'discord.js';
import { asc, eq } from 'drizzle-orm';
import db from '../../../db/db';
import { item } from '../../../db/schema';
import embedList from '../../../utils/embed-list';
import Command from '../../base-command';

export default class Shop implements Command {
    async execute(message: Message): Promise<void> {
        const items = await db
            .select({
                name: item.name,
                price: item.price,
                durability: item.durability,
            })
            .from(item)
            .where(eq(item.canBuy, true))
            .orderBy(asc(item.price));

        if (items.length === 0) {
            await message.reply('Sua loja não possuem items, você pode criar eles com o comando `;create-item`.');
            return;
        }

        await embedList(items, 10, message, this.getShopEmbed);
    }

    private getShopEmbed(
        matrix: Array<
            Array<{
                name: string;
                price: number;
                durability: number;
            }>
        >,
        currentIndex: number,
    ): EmbedBuilder {
        const shopEmbed = new EmbedBuilder()
            .setTitle('Loja')
            .setColor(Colors.Yellow)
            .setFooter({ text: `Página ${currentIndex + 1}/${matrix.length}` });

        matrix[currentIndex].forEach((item) => {
            shopEmbed.addFields(
                {
                    name: `$${item.price} - ${item.name}`,
                    value: `Durabilidade: ${item.durability} usos.`,
                    inline: false,
                },
                {
                    name: ' ',
                    value: ' ',
                    inline: false,
                },
            );
        });

        return shopEmbed;
    }
}
