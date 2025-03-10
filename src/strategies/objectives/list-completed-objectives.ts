import { Colors, EmbedBuilder, Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { completedObjective, objective, objectiveDifficulty } from '../../db/schema';
import { getCharacter } from '../../utils';
import Strategy from '../base-strategy';

export default class ListCompletedObjectivesStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const char = await getCharacter(message, messageAsList);

        const completedObjectives = await db
            .select({
                difficultyName: objectiveDifficulty.name,
                objectiveName: objective.name,
            })
            .from(completedObjective)
            .where(eq(completedObjective.characterId, char.id))
            .innerJoin(objective, eq(completedObjective.objectiveId, objective.id))
            .innerJoin(objectiveDifficulty, eq(objective.type, objectiveDifficulty.id));

        const objectiveEmbed = new EmbedBuilder().setColor(Colors.DarkRed).setTitle(`Objetivos concluídos de ${char.name}`);

        completedObjectives.forEach((completed) => {
            objectiveEmbed.addFields({
                name: completed.objectiveName,
                value: completed.difficultyName,
                inline: false,
            });
        });
        message.reply({ embeds: [objectiveEmbed] });
    }
}
