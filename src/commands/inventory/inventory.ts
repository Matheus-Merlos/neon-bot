import { Colors, EmbedBuilder, Message } from 'discord.js';
import { desc, eq } from 'drizzle-orm';
import db from '../../db/db';
import { rank, reachedRank } from '../../db/schema';
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

        let [actualRank] = await db
            .select({ name: rank.name })
            .from(reachedRank)
            .innerJoin(rank, eq(reachedRank.rankId, rank.id))
            .orderBy(desc(rank.id))
            .where(eq(reachedRank.characterId, char.id))
            .limit(1);

        if (!actualRank) {
            actualRank = {
                name: 'Bronze',
            };
        }

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
            );

        message.reply({ embeds: [embed] });
    }
}
