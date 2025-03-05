import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { completedObjective, objective, selectedObjective } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import getIdFromMention from '../../utils/get-id-from-mention';
import Strategy from '../base-strategy';

export default class SelectObjectiveStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        let char;
        if (messageAsList[0] && messageAsList[0].includes('@')) {
            char = await CharacterFactory.getInstance().getFromPlayerId(getIdFromMention(messageAsList[1]), message.guildId!);
            messageAsList.splice(0, 1);
        } else {
            char = await CharacterFactory.getInstance().getFromPlayerId(message.author.id, message.guildId!);
        }

        const objectiveName = messageAsList.join(' ');

        let objectiveToSelect;
        try {
            objectiveToSelect = await ObjectiveFactory.getInstance().getByName(objectiveName, message.guildId!);
        } catch {
            message.reply(`Não existe um objetivo com o nome **${objectiveName}**.`);
            return;
        }

        const alreadyCompletedObjectives = (
            await db
                .select({
                    id: completedObjective.objectiveId,
                })
                .from(completedObjective)
                .where(eq(completedObjective.characterId, char.id))
        ).map((obj) => obj.id);

        if (alreadyCompletedObjectives.includes(objectiveToSelect.id)) {
            message.reply(`Você já concluiu esse objetivo anteriormente.`);
            return;
        }

        const alreadySelectedObjectives = (
            await db
                .select({
                    difficultyId: objective.type,
                })
                .from(selectedObjective)
                .where(eq(selectedObjective.characterId, char.id))
                .innerJoin(objective, eq(selectedObjective.objectiveId, objective.id))
        ).map((obj) => obj.difficultyId);

        if (alreadySelectedObjectives.includes(objectiveToSelect.type)) {
            message.reply(`Você já tem um objetivo dessa dificuldade selecionado.`);
            return;
        }

        await db.insert(selectedObjective).values({ characterId: char.id, objectiveId: objectiveToSelect.id });
        message.reply(`Objetivo **${objectiveToSelect.name}** selecionado com sucesso.`);
    }
}
