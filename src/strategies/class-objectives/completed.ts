import { Message } from 'discord.js';
import { and, eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, completedClassObjective } from '../../db/schema';
import ClassObjectiveFactory from '../../factories/class-objectives/class-objective-factory';
import { getCharacter } from '../../utils';
import checkCaracterLevelUp from '../../utils/check-character-levelup';
import Strategy from '../base-strategy';

export default class CompletedClassObjectiveStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const char = await getCharacter(message, messageAsList);

        const classObjectiveName = messageAsList.join(' ');

        let classObjective;
        try {
            classObjective = await ClassObjectiveFactory.getByName(classObjectiveName, message.guildId!);
        } catch {
            message.reply(`Não existe um objetivo de classe com o nome **${classObjectiveName}**`);
            return;
        }

        if (classObjective.classId !== char.characterClass) {
            message.reply(`O personagem selecionado não possui a classe deste objetivo.`);
            return;
        }

        const [clsObj] = await db
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
            return;
        }

        await checkCaracterLevelUp(message, char, classObjective.xp);

        await db.transaction(async (trx) => {
            await trx
                .update(completedClassObjective)
                .set({ completed: true })
                .where(
                    and(
                        eq(completedClassObjective.classObjectiveId, classObjective.id),
                        eq(completedClassObjective.characterId, char.id),
                    ),
                );

            await trx
                .update(character)
                .set({ xp: char.xp + classObjective.xp, gold: char.gold + classObjective.gold })
                .where(eq(character.id, char.id));

            message.reply(`Objetivo completado com sucesso.`);
            return;
        });
    }
}
