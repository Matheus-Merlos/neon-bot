import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    EmbedBuilder,
    Message,
} from 'discord.js';
import { asc, count, desc, eq, gt } from 'drizzle-orm';
import db from '../../db/db';
import { inventory, item, rank, reachedRank } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import { getIdFromMention } from '../../utils';
import Command from '../base-command';

export default class Inventory implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        let playerId;
        if (messageAsList[1]) {
            playerId = getIdFromMention(messageAsList[1]);
        }
        if (!playerId) {
            playerId = message.author.id;
        }

        const char = await CharacterFactory.getFromId(playerId, message);
        if (!char) {
            return;
        }

        let [actualRank]: Array<{ id: number; name: string }> | undefined = await db
            .select({ id: rank.id, name: rank.name })
            .from(reachedRank)
            .innerJoin(rank, eq(reachedRank.rankId, rank.id))
            .orderBy(desc(reachedRank.id))
            .where(eq(reachedRank.characterId, char.id))
            .limit(1);

        if (!actualRank) {
            actualRank = { id: 0, name: 'Bronze' };
        }

        let [nextReacheableRank] = await db
            .select({ name: rank.name, necessaryXp: rank.necessaryXp })
            .from(rank)
            .where(gt(rank.id, actualRank.id))
            .orderBy(asc(rank.id))
            .limit(1);

        let nextRankDiff: number | string = ' ';
        if (!nextReacheableRank) {
            nextReacheableRank = { name: 'Nenhum', necessaryXp: 0 };
        } else {
            nextRankDiff = nextReacheableRank.necessaryXp - char.xp;
        }
        const inventoryItems = await db
            .select({
                quantity: count(inventory.itemId),
                name: item.name,
            })
            .from(inventory)
            .where(eq(inventory.characterId, char.id))
            .innerJoin(item, eq(inventory.itemId, item.id))
            .groupBy(item.name);

        const itemMatrix: Array<Array<{ quantity: number; name: string }>> = [];

        for (let i = 0; i < inventoryItems.length; i += 3) {
            const itemSublist = inventoryItems.slice(i, i + 3);

            itemMatrix.push(itemSublist);
        }

        let currentIndex = 0;

        let inventoryEmbed = this.getInventoryEmbed(
            char.name,
            char.xp,
            char.gold,
            actualRank.name,
            itemMatrix[currentIndex],
            itemMatrix.length,
            currentIndex,
            nextReacheableRank.name,
            nextRankDiff,
            char.imageUrl,
        );

        const forwardButton = new ButtonBuilder()
            .setCustomId('forward')
            .setLabel('Próximo')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(itemMatrix.length < 1);

        const backwardsButton = new ButtonBuilder()
            .setCustomId('backward')
            .setLabel('Anterior')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        if (itemMatrix.length == currentIndex + 1) {
            forwardButton.setDisabled(true);
        }

        let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            backwardsButton,
            forwardButton,
        );

        const invMessage = await message.reply({ embeds: [inventoryEmbed], components: [row] });

        try {
            const collector = invMessage.createMessageComponentCollector({ time: 60_000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'forward') currentIndex++;
                if (interaction.customId === 'backward') currentIndex--;

                forwardButton.setDisabled(currentIndex === itemMatrix.length - 1);
                backwardsButton.setDisabled(currentIndex === 0);

                inventoryEmbed = this.getInventoryEmbed(
                    char.name,
                    char.xp,
                    char.gold,
                    actualRank.name,
                    itemMatrix[currentIndex],
                    itemMatrix.length,
                    currentIndex,
                    nextReacheableRank.name,
                    nextRankDiff,
                    char.imageUrl,
                );

                row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    backwardsButton,
                    forwardButton,
                );

                await interaction.deferUpdate();
                await invMessage.edit({ embeds: [inventoryEmbed], components: [row] });
            });
        } catch {
            return;
        }
    }

    private getInventoryEmbed(
        characterName: string,
        exp: number,
        gold: number,
        currentRank: string,
        items: Array<{ quantity: number; name: string }>,
        totalPages: number,
        currentPage: number,
        nextRank: string,
        necessaryXp: number | string,
        imageUrl: string | null,
    ): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`Inventário de ${characterName}`)
            .addFields(
                { name: 'EXP', value: `${exp}`, inline: true },
                {
                    name: 'Gold',
                    value: `${gold}`,
                    inline: true,
                },
                {
                    name: 'Rank',
                    value: currentRank,
                    inline: true,
                },
                {
                    name: 'Próximo Rank',
                    value: nextRank,
                    inline: true,
                },
                {
                    name: 'XP Faltando',
                    value: `${necessaryXp}`,
                    inline: true,
                },
                { name: '\u200B', value: '\u200B' },
            );

        if (items) {
            items.forEach((item) => {
                embed.addFields({
                    name: `${item.quantity} - ${item.name}`,
                    value: `Item`,
                    inline: false,
                });
            });
        }

        if (imageUrl) {
            embed.setThumbnail(imageUrl);
        }

        embed.setFooter({ text: `Página ${currentPage + 1}/${totalPages === 0 ? 1 : totalPages}` });

        return embed;
    }
}
