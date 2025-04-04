import { Message } from 'discord.js';
import { and, eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, completedObjective, selectedObjective } from '../../db/schema';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import { getCharacter } from '../../utils';
import checkCaracterLevelUp from '../../utils/check-character-levelup';
import Strategy from '../base-strategy';

export default class CompleteObjectiveStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const char = await getCharacter(message, messageAsList);

        const objectiveName = messageAsList.join(' ');
        let objective;
        try {
            objective = await ObjectiveFactory.getByName(objectiveName, message.guildId!);
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

        await checkCaracterLevelUp(message, char, objective.xp);

        await db.transaction(async (trx) => {
            await trx
                .update(character)
                .set({ xp: char.xp + objective.xp, gold: char.gold + objective.gold })
                .where(eq(character.id, char.id));

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
