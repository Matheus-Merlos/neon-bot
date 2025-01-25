import { Colors, EmbedBuilder, Message } from 'discord.js';
import { asc, count, desc, eq, gt } from 'drizzle-orm';
import db from '../../db/db';
import { inventory, item, rank, reachedRank } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import embedList from '../../utils/embed-list';
import getIdFromMention from '../../utils/get-id-from-mention';
import Command from '../base-command';

export default class Inventory implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
        let char;
        if (messageAsList[0].includes('@')) {
            char = await CharacterFactory.getInstance().getFromPlayerId(getIdFromMention(messageAsList[1]), message.guild!.id);
            messageAsList.splice(0, 1);
        } else {
            char = await CharacterFactory.getInstance().getFromPlayerId(message.author.id, message.guild!.id);
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
                quantity: count(inventory.itemId).as('quantity'),
                itemId: inventory.itemId,
                name: item.name,
            })
            .from(inventory)
            .where(eq(inventory.characterId, char.id))
            .innerJoin(item, eq(inventory.itemId, item.id))
            .groupBy(inventory.itemId, item.name);

        await embedList(inventoryItems, 3, message, async (matrix: Array<typeof inventoryItems>, currentIndex) => {
            const embed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle(`Inventário de ${char.name}`)
                .addFields(
                    { name: 'EXP', value: `${char.xp}`, inline: true },
                    {
                        name: 'Gold',
                        value: `${char.gold}`,
                        inline: true,
                    },
                    {
                        name: 'Rank',
                        value: actualRank.name,
                        inline: true,
                    },
                    {
                        name: 'Próximo Rank',
                        value: nextReacheableRank.name,
                        inline: true,
                    },
                    {
                        name: 'XP Faltando',
                        value: `${nextRankDiff}`,
                        inline: true,
                    },
                    { name: '\u200B', value: '\u200B' },
                );

            if (matrix[currentIndex] && matrix[currentIndex].length > 0) {
                for (const item of matrix[currentIndex]) {
                    const itemDurabilities = (
                        await db
                            .select({ durability: inventory.durability })
                            .from(inventory)
                            .where(eq(inventory.itemId, item.itemId))
                            .orderBy(asc(inventory.durability))
                    ).map((i) => i.durability);

                    embed.addFields({
                        name: `${item.quantity} - ${item.name}`,
                        value: `Durabilidades: ${itemDurabilities}`,
                        inline: false,
                    });
                }
            }

            if (char.imageUrl) {
                embed.setThumbnail(char.imageUrl);
            }

            embed.setFooter({ text: `Página ${currentIndex + 1}/${matrix.length === 0 ? 1 : matrix.length}` });

            return embed;
        });
    }
}
