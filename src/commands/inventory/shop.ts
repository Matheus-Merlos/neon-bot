import { eq } from 'drizzle-orm';
import db from '../../models/db';
import { item } from '../../models/schema';
import { Command } from '../command';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from 'discord.js';

type Item = {
    itemName: string;
    value: number;
    itemDescription: string;
};

const MAX_ITEMS_PER_PAGE = 5;

export default class Shop implements Command {
    public async execute(message: Message): Promise<void> {
        let items: Array<Array<Item>>;

        try {
            items = await this.fetchItems();
        } catch (error) {
            message.reply(`Houve um erro ao trazer os itens da base de dados: **${error}**`);
            return;
        }

        let currentPage: number = 0;

        const embed = this.createOrUpdateShopList(items, currentPage, message);
        let buttons = this.createOrUpdateButtons(items, currentPage);

        const sentMsg = await message.reply({ embeds: [embed], components: [buttons] });
        const collector = sentMsg.createMessageComponentCollector({ time: 60_000 });

        collector.on('collect', (interaction) => {
            if (interaction.customId === 'forward-shop') currentPage++;
            if (interaction.customId === 'backward-shop') currentPage--;

            const editedEmbed = this.createOrUpdateShopList(items, currentPage, message);
            buttons = this.createOrUpdateButtons(items, currentPage);

            interaction.update({ embeds: [editedEmbed], components: [buttons] });
        });
    }
    private createOrUpdateButtons(
        items: Array<Array<Item>>,
        currentPage: number,
    ): ActionRowBuilder<ButtonBuilder> {
        const forward = new ButtonBuilder()
            .setCustomId('forward-shop')
            .setLabel('Próxima página')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === items.length - 1);

        const backward = new ButtonBuilder()
            .setCustomId('backward-shop')
            .setLabel('Página Anterior')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0);

        const row: ActionRowBuilder<ButtonBuilder> =
            new ActionRowBuilder<ButtonBuilder>().addComponents(backward, forward);

        return row;
    }
    private createOrUpdateShopList(
        items: Array<Array<Item>>,
        currentPage: number,
        message: Message,
    ): EmbedBuilder {
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor('Purple')
            .setTitle(`Loja do server ${message.guild!.name}`)
            .setDescription(
                'Compre um item com o comando `;buy <nome_do_item>`\nPara mais informações de um item use o comando `;item <nome_do_item>`\nA loja só mostra itens que estão a venda, para ver todos os itens, use o comando `;items`',
            )
            .setFields(
                ...items[currentPage].map((item: Item) => ({
                    name: `- ${item.itemName} - $${item.value}`,
                    value: item.itemDescription,
                    inline: false,
                })),
            )
            .setFooter({ text: `Página ${currentPage + 1}/${items.length}` });
        return embed;
    }
    private async fetchItems(): Promise<Array<Array<Item>>> {
        const groups: Array<Array<Item>> = [];
        const itemList = await db
            .select({
                itemName: item.nome,
                value: item.preco,
                itemDescription: item.descricao,
            })
            .from(item)
            .where(eq(item.disponivel, true))
            .orderBy(item.preco);

        for (let i = 0; i < itemList.length; i += MAX_ITEMS_PER_PAGE) {
            groups.push(itemList.slice(i, i + MAX_ITEMS_PER_PAGE));
        }

        return groups;
    }
}
