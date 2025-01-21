import { Message } from 'discord.js';
import { and, eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, completedClassObjective } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import ClassObjectiveFactory from '../../factories/class-objectives/class-objective-factory';
import checkCaracterLevelUp from '../../utils/check-character-levelup';
import getIdFromMention from '../../utils/get-id-from-mention';
import Command from '../base-command';

export default class CompletedClassObjective implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const hasMention = messageAsList[1].includes('@');
        let char;
        if (hasMention) {
            char = await CharacterFactory.getFromId(getIdFromMention(messageAsList[1]), message);
            messageAsList.splice(0, 1);
        } else {
            char = await CharacterFactory.getFromId(message.author.id, message);
        }

        messageAsList.splice(0, 1);

        const classObjectiveName = messageAsList.join(' ');

        let classObjective;
        try {
            classObjective = await ClassObjectiveFactory.getInstance().getByName(classObjectiveName);
        } catch {
            message.reply(`Não existe um objetivo de classe com o nome **${classObjectiveName}**`);
            return;
        }

        if (classObjective.classId !== char.characterClass) {
            message.reply(`O personagem selecionado não possui a classe deste objetivo.`);
            return;
        }

        await db.transaction(async (trx) => {
            const [clsObj] = await trx
                .select()
                .from(completedClassObjective)
                .where(
                    and(
                        eq(completedClassObjective.classObjectiveId, classObjective.id),
                        eq(completedClassObjective.characterId, char.id),
                    ),
                );

            if (clsObj.completed) {
                message.reply(`**${char.name}** já completou este objetivo.`);
                trx.rollback();
                return;
            }

            await trx
                .update(completedClassObjective)
                .set({ completed: true })
                .where(
                    and(
                        eq(completedClassObjective.classObjectiveId, classObjective.id),
                        eq(completedClassObjective.characterId, char.id),
                    ),
                );

            await checkCaracterLevelUp(message, char, classObjective.xp);

            await trx
                .update(character)
                .set({ xp: char.xp + classObjective.xp, gold: char.gold + classObjective.gold })
                .where(eq(character.id, char.id));

            message.reply(`Objetivo completado com sucesso.`);
            return;
        });
    }
}
