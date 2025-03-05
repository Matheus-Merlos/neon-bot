import { Colors, EmbedBuilder, Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { objective, objectiveDifficulty, selectedObjective as selectedTable } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import getIdFromMention from '../../utils/get-id-from-mention';
import Strategy from '../base-strategy';

export default class SelectedObjectivesStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        let char;
        if (messageAsList[0].includes('@')) {
            char = await CharacterFactory.getInstance().getFromPlayerId(getIdFromMention(messageAsList[1]), message.guildId!);
            messageAsList.splice(0, 1);
        } else {
            char = await CharacterFactory.getInstance().getFromPlayerId(message.author.id, message.guildId!);
        }

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
