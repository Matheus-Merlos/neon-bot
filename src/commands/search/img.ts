import axios, { AxiosError } from 'axios';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, Message } from 'discord.js';
import Command from '../base-command';

enum Actions {
    FORWARD = 'forward',
    BACKWARDS = 'backwards',
    DELETE = 'delete',
}

type ResultItem = {
    title: string;
    link: string;
    displayLink: string;
};

export default class Image implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const query = messageAsList.join(' ');
        let response;
        try {
            response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    q: query,
                    key: process.env.GOOGLE_API_KEY!,
                    cx: process.env.SEARCH_ENGINE_ID!,
                    searchType: 'image',
                    num: 10,
                },
            });
        } catch (error) {
            if (error instanceof AxiosError) {
                message.reply(`Erro ao pesquisar imagem: ${error.name}: ${error.message}`);
                return;
            }
            return;
        }

        const items: Array<ResultItem> = response.data.items;
        const numResults = items.length;
        let currentPage = 0;

        const forwardButton = new ButtonBuilder()
            .setCustomId(Actions.FORWARD)
            .setLabel('Próximo')
            .setStyle(ButtonStyle.Primary);

        const backwardsButton = new ButtonBuilder()
            .setCustomId(Actions.BACKWARDS)
            .setLabel('Anterior')
            .setStyle(ButtonStyle.Primary)
            .setDisabled();

        if (numResults == currentPage + 1) {
            forwardButton.setDisabled(true);
        }

        const deleteButton = new ButtonBuilder().setCustomId(Actions.DELETE).setLabel('Deletar').setStyle(ButtonStyle.Danger);

        let actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backwardsButton, forwardButton, deleteButton);

        let embed = this.getEmbed(items[currentPage].link, items[currentPage].title, message, currentPage, numResults);
        const msg = await message.reply({ components: [actionRow], embeds: [embed] });

        try {
            const collector = msg.createMessageComponentCollector({ time: 120_000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === Actions.BACKWARDS) currentPage--;
                if (interaction.customId === Actions.FORWARD) currentPage++;
                if (interaction.customId === Actions.DELETE) {
                    await msg.delete();
                    await message.delete();
                    return;
                }

                forwardButton.setDisabled(currentPage === numResults - 1);
                backwardsButton.setDisabled(currentPage === 0);

                actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backwardsButton, forwardButton, deleteButton);

                await interaction.deferUpdate();
                embed = this.getEmbed(items[currentPage].link, items[currentPage].title, message, currentPage, numResults);
                await msg.edit({ embeds: [embed], components: [actionRow] });
            });
        } catch {
            await msg.edit({ embeds: [embed], components: [] });
        }
    }

    private getEmbed(imgUrl: string, title: string, message: Message, currentPage: number, totalPages: number): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.avatarURL({ extension: 'png', size: 64 })!,
            })
            .setTitle(title)
            .setDescription(`[${title}](${imgUrl})`)
            .setImage(imgUrl)
            .setFooter({ text: `Página ${currentPage + 1}/${totalPages}` });

        return embed;
    }
}
