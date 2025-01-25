import { Message, PermissionFlagsBits } from 'discord.js';
import { and, eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, completedClassObjective } from '../../db/schema';
import hasPermission from '../../decorators/has-permission';
import CharacterFactory from '../../factories/character-factory';
import ClassObjectiveFactory from '../../factories/class-objectives/class-objective-factory';
import checkCaracterLevelUp from '../../utils/check-character-levelup';
import getIdFromMention from '../../utils/get-id-from-mention';
import Command from '../base-command';

export default class CompletedClassObjective implements Command {
    @hasPermission(PermissionFlagsBits.ManageRoles)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
        let char;
        if (messageAsList[0].includes('@')) {
            char = await CharacterFactory.getInstance().getFromPlayerId(getIdFromMention(messageAsList[1]), message.guild!.id);
            messageAsList.splice(0, 1);
        } else {
            char = await CharacterFactory.getInstance().getFromPlayerId(message.author.id, message.guild!.id);
        }

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
