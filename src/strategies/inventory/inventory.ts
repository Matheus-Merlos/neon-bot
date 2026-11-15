import { ChatInputCommandInteraction, Colors, EmbedBuilder, Message } from 'discord.js';
import { and, asc, count, desc, eq, gt } from 'drizzle-orm';
import db from '../../db/db';
import { inventory, item, rank, reachedRank } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import embedList from '../../utils/embed-list';
import getLeaderboardPlacement from '../../utils/leaderboard';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
};

export default class InventoryStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const char = await CharacterFactory.getFromPlayerId(input.playerId, replyInstance.guildId!);

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

        await embedList(
            inventoryItems,
            3,
            replyInstance,
            async (matrix: Array<typeof inventoryItems>, currentIndex) => {
                const embed = new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`Inventário de ${char.name}`)
                    .addFields(
                        { name: 'EXP', value: `${char.xp}`, inline: true },
                        { name: 'Gold', value: `${char.gold}`, inline: true },
                        { name: 'Rank', value: actualRank.name, inline: true },
                        { name: 'Próximo Rank', value: nextReacheableRank.name, inline: true },
                        { name: 'XP Faltando', value: `${nextRankDiff}`, inline: true },
                        { name: ' ', value: ' ' },
                        {
                            name: 'Ranking de Dinheiro',
                            value: `#${await getLeaderboardPlacement(replyInstance.guildId!, input.playerId, 'gold')}`,
                            inline: true,
                        },
                        {
                            name: 'Ranking de XP',
                            value: `#${await getLeaderboardPlacement(replyInstance.guildId!, input.playerId, 'xp')}`,
                            inline: true,
                        },
                        { name: '​', value: '​' },
                    );

                if (matrix[currentIndex] && matrix[currentIndex].length > 0) {
                    for (const invItem of matrix[currentIndex]) {
                        const itemDurabilities = (
                            await db
                                .select({ durability: inventory.durability })
                                .from(inventory)
                                .where(
                                    and(
                                        eq(inventory.itemId, invItem.itemId),
                                        eq(inventory.characterId, char.id),
                                    ),
                                )
                                .orderBy(asc(inventory.durability))
                        ).map((i) => i.durability);

                        embed.addFields({
                            name: `${invItem.quantity} - ${invItem.name}`,
                            value: `Durabilidade do item atual: ${itemDurabilities[0]}`,
                            inline: false,
                        });
                    }
                }

                if (char.imageUrl) {
                    embed.setThumbnail(char.imageUrl);
                }

                embed.setFooter({
                    text: `Página ${currentIndex + 1}/${matrix.length === 0 ? 1 : matrix.length}`,
                });

                return embed;
            },
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const playerId = interaction.options.getUser('player')?.id ?? interaction.user.id;
        await this.handleInput({ playerId }, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const playerId = messageAsList[0]
            ? messageAsList[0].replace(/[<@!>]/g, '')
            : message.author.id;
        await this.handleInput({ playerId }, message);
    }
}
