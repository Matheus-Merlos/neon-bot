import { Colors, EmbedBuilder, Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { objective, objectiveDifficulty, selectedObjective as selectedTable } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import Command from '../base-command';

export default class SelectedObjectives implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const char = await CharacterFactory.getFromId(message.author.id, message);

        const selectedObjectives = await db
            .select({
                difficultyName: objectiveDifficulty.name,
                objectiveName: objective.name,
            })
            .from(selectedTable)
            .where(eq(selectedTable.characterId, char.id))
            .innerJoin(objective, eq(selectedTable.objectiveId, objective.id))
            .innerJoin(objectiveDifficulty, eq(objective.type, objectiveDifficulty.id));

        const objectiveEmbed = new EmbedBuilder().setColor(Colors.DarkRed).setTitle(`Objetivos Selecionados de ${char.name}`);

        selectedObjectives.forEach((selectedObjective) => {
            objectiveEmbed.addFields({
                name: selectedObjective.difficultyName,
                value: selectedObjective.objectiveName,
                inline: false,
            });
        });
        message.reply({ embeds: [objectiveEmbed] });
    }
}
