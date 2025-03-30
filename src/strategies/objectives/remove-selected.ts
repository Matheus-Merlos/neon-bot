import { Message } from 'discord.js';
import { and, eq } from 'drizzle-orm';
import db from '../../db/db';
import { completedObjective, selectedObjective } from '../../db/schema';
import { ObjectiveFactory } from '../../factories';
import { getCharacter } from '../../utils';
import Strategy from '../base-strategy';

export default class RemoveSelectedObjectiveStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const char = await getCharacter(message, messageAsList);

        const objectiveName = messageAsList.join(' ');

        let objectiveToRemove;
        try {
            objectiveToRemove = await ObjectiveFactory.getByName(objectiveName, message.guildId!);
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

        if (alreadyCompletedObjectives.includes(objectiveToRemove.id)) {
            message.reply(`Você já concluiu esse objetivo anteriormente. Tá querendo remover por que?`);
            return;
        }

        const alreadySelectedObjectives = await db
            .select()
            .from(selectedObjective)
            .where(and(eq(selectedObjective.characterId, char.id), eq(selectedObjective.objectiveId, objectiveToRemove.id)));

        if (!alreadySelectedObjectives[0]) {
            message.reply(`Você não possui esse objetivo selecionado.`);
            return;
        }

        await db
            .delete(selectedObjective)
            .where(and(eq(selectedObjective.characterId, char.id), eq(selectedObjective.objectiveId, objectiveToRemove.id)));
        message.reply(`Objetivo **${objectiveToRemove.name}** de-selecionado com sucesso.`);
    }
}
