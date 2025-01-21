import { Message } from 'discord.js';
import { and, eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, completedObjective, selectedObjective } from '../../db/schema';
import hasMention from '../../decorators/has-mention';
import CharacterFactory from '../../factories/character-factory';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import checkCaracterLevelUp from '../../utils/check-character-levelup';
import getIdFromMention from '../../utils/get-id-from-mention';
import Command from '../base-command';

export default class CompletedObjective implements Command {
    @hasMention()
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);

        const char = await CharacterFactory.getFromId(getIdFromMention(messageAsList[0]), message);

        messageAsList.splice(0, 1);

        const objectiveName = messageAsList.join(' ');
        let objective;
        try {
            objective = await ObjectiveFactory.getInstance().getByName(objectiveName);
        } catch {
            message.reply(`Não existe um objetivo com o nome **${objectiveName}**.`);
            return;
        }

        const selectedObjectives = (
            await db
                .select({
                    id: selectedObjective.objectiveId,
                })
                .from(selectedObjective)
                .where(eq(selectedObjective.characterId, char.id))
        ).map((obj) => obj.id);

        if (!selectedObjectives.includes(objective.id)) {
            message.reply(`O jogador mencionado não possui esse objetivo selecionado`);
            return;
        }

        await db.transaction(async (trx) => {
            await checkCaracterLevelUp(message, char, objective.xp);

            await trx.update(character).set({ xp: char.xp + objective.xp, gold: char.gold + objective.gold });

            await trx
                .delete(selectedObjective)
                .where(and(eq(selectedObjective.objectiveId, objective.id), eq(selectedObjective.characterId, char.id)));

            await trx.insert(completedObjective).values({ characterId: char.id, objectiveId: objective.id });
        });

        await message.reply(
            `<@${char.player}> você completou o objetivo **${objective.name}**. Agora você pode escolher outro usando o comando \`;choose-objective\``,
        );
    }
}
