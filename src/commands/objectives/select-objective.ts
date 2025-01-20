import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { objective, selectedObjective } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import ObjectiveFactory from '../../factories/objective-factory';
import Command from '../base-command';

export default class SelectObjective implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);

        const itemName = messageAsList.join(' ');

        const char = await CharacterFactory.getFromId(message.author.id, message);
        let objectiveToSelect;
        try {
            objectiveToSelect = await ObjectiveFactory.getInstance().getByName(itemName);
        } catch {
            message.reply(`Não existe um objetivo com o nome **${itemName}**.`);
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
