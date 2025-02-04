import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from 'discord.js';

export default async function embedList<T extends object>(
    list: Array<T>,
    itemsPerPage: number,
    message: Message,
    embedBuilderFn: (matrix: Array<Array<T>>, currentIndex: number) => EmbedBuilder | Promise<EmbedBuilder>,
) {
    const matrix: Array<Array<T>> = [];

    for (let i = 0; i < list.length; i += itemsPerPage) {
        const itemSublist = list.slice(i, i + itemsPerPage);

        matrix.push(itemSublist);
    }

    let currentIndex = 0;

    const forwardButton = new ButtonBuilder().setCustomId('forward').setLabel('Próximo').setStyle(ButtonStyle.Primary);

    const backwardsButton = new ButtonBuilder()
        .setCustomId('backward')
        .setLabel('Anterior')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    if (matrix.length == currentIndex + 1) {
        forwardButton.setDisabled(true);
    }

    let optionsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backwardsButton, forwardButton);

    let embed: EmbedBuilder = await embedBuilderFn(matrix, currentIndex);

    const msg = await message.reply({ embeds: [embed], components: [optionsRow] });

    try {
        const collector = msg.createMessageComponentCollector({ time: 120_000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'forward') currentIndex++;
            if (interaction.customId === 'backward') currentIndex--;

            forwardButton.setDisabled(currentIndex === matrix.length - 1);
            backwardsButton.setDisabled(currentIndex === 0);

            optionsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backwardsButton, forwardButton);

            embed = await embedBuilderFn(matrix, currentIndex);

            await interaction.deferUpdate();
            await msg.edit({ embeds: [embed], components: [optionsRow] });
        });
    } catch {
        return;
    }
}
