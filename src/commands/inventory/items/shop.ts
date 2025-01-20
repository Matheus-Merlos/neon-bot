import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, Message } from 'discord.js';
import { asc, eq } from 'drizzle-orm';
import db from '../../../db/db';
import { item } from '../../../db/schema';
import Command from '../../base-command';

export type Item = {
    name: string;
    price: number;
    durability: number;
};

const ITEMS_PER_PAGE = 10;

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

        const itemMatrix: Array<Array<Item>> = [];

        for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
            const itemSublist = items.slice(i, i + ITEMS_PER_PAGE);

            itemMatrix.push(itemSublist);
        }

        let currentIndex = 0;

        let shopEmbed = this.getShopEmbed(itemMatrix[currentIndex], itemMatrix.length, currentIndex);

        const forwardButton = new ButtonBuilder().setCustomId('forward').setLabel('Próximo').setStyle(ButtonStyle.Primary);

        const backwardsButton = new ButtonBuilder()
            .setCustomId('backward')
            .setLabel('Anterior')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        if (itemMatrix.length == currentIndex + 1) {
            forwardButton.setDisabled(true);
        }

        let row = new ActionRowBuilder<ButtonBuilder>().addComponents(backwardsButton, forwardButton);

        const shopMessage = await message.reply({ embeds: [shopEmbed], components: [row] });

        try {
            const collector = shopMessage.createMessageComponentCollector({ time: 60_000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'forward') currentIndex++;
                if (interaction.customId === 'backward') currentIndex--;

                forwardButton.setDisabled(currentIndex === itemMatrix.length - 1);
                backwardsButton.setDisabled(currentIndex === 0);

                shopEmbed = this.getShopEmbed(itemMatrix[currentIndex], itemMatrix.length, currentIndex);

                row = new ActionRowBuilder<ButtonBuilder>().addComponents(backwardsButton, forwardButton);

                await interaction.deferUpdate();
                await shopMessage.edit({ embeds: [shopEmbed], components: [row] });
            });
        } catch {
            return;
        }
    }

    private getShopEmbed(items: Array<Item>, totalPages: number, currentIndex: number): EmbedBuilder {
        const shopEmbed = new EmbedBuilder()
            .setTitle('Loja')
            .setColor(Colors.Yellow)
            .setFooter({ text: `Página ${currentIndex + 1}/${totalPages}` });

        items.forEach((item) => {
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
