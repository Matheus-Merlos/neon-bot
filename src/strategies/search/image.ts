import axios, { AxiosError } from 'axios';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    Message,
} from 'discord.js';
import { IStrategy } from '../base-strategy';

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

type Input = {
    query: string;
};

export default class ImageSearchStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const userId = 'author' in replyInstance ? replyInstance.author.id : replyInstance.user.id;
        const userAvatar =
            'author' in replyInstance
                ? replyInstance.author.avatarURL({ extension: 'png', size: 64 })!
                : replyInstance.user.avatarURL({ extension: 'png', size: 64 })!;
        const userName =
            'author' in replyInstance ? replyInstance.author.username : replyInstance.user.username;

        let response;
        try {
            response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    q: input.query,
                    key: process.env.GOOGLE_API_KEY!,
                    cx: process.env.SEARCH_ENGINE_ID!,
                    searchType: 'image',
                    num: 10,
                },
            });
        } catch (error) {
            if (error instanceof AxiosError) {
                replyInstance.reply(`Erro ao pesquisar imagem: ${error.name}: ${error.message}`);
                return;
            }
            return;
        }

        const items: ResultItem[] = response.data.items;
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

        const deleteButton = new ButtonBuilder()
            .setCustomId(Actions.DELETE)
            .setLabel('Deletar')
            .setStyle(ButtonStyle.Danger);

        let actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            backwardsButton,
            forwardButton,
            deleteButton,
        );

        let embed = this.getEmbed(
            items[currentPage].link,
            items[currentPage].title,
            userName,
            userAvatar,
            currentPage,
            numResults,
        );

        const msg = await replyInstance.reply({ components: [actionRow], embeds: [embed] });
        const replyMsg = 'author' in replyInstance ? msg : await replyInstance.fetchReply();

        try {
            const collector = replyMsg.createMessageComponentCollector({ time: 120_000 });

            collector.on('collect', async (interaction) => {
                if (interaction.user.id !== userId) return;

                if (interaction.customId === Actions.BACKWARDS) currentPage--;
                if (interaction.customId === Actions.FORWARD) currentPage++;
                if (interaction.customId === Actions.DELETE) {
                    await replyMsg.delete();
                    if ('author' in replyInstance) {
                        await replyInstance.delete();
                    }
                    return;
                }

                forwardButton.setDisabled(currentPage === numResults - 1);
                backwardsButton.setDisabled(currentPage === 0);

                actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    backwardsButton,
                    forwardButton,
                    deleteButton,
                );

                await interaction.deferUpdate();
                embed = this.getEmbed(
                    items[currentPage].link,
                    items[currentPage].title,
                    userName,
                    userAvatar,
                    currentPage,
                    numResults,
                );
                await replyMsg.edit({ embeds: [embed], components: [actionRow] });
            });
        } catch {
            await replyMsg.edit({ embeds: [embed], components: [] });
        }
    }

    private getEmbed(
        imgUrl: string,
        title: string,
        userName: string,
        userAvatar: string,
        currentPage: number,
        totalPages: number,
    ): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(Colors.Blue)
            .setAuthor({ name: userName, iconURL: userAvatar })
            .setTitle(title)
            .setDescription(`[${title}](${imgUrl})`)
            .setImage(imgUrl)
            .setFooter({ text: `Página ${currentPage + 1}/${totalPages}` });
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const query = interaction.options.getString('query', true);
        await this.handleInput({ query }, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const query = messageAsList.join(' ');
        await this.handleInput({ query }, message);
    }
}
