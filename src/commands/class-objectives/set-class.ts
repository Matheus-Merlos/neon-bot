import { Message, PermissionFlagsBits } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, classObjective, completedClassObjective } from '../../db/schema';
import hasPermission from '../../decorators/has-permission';
import CharacterFactory from '../../factories/character-factory';
import ClassFactory from '../../factories/class-objectives/class-factory';
import getIdFromMention from '../../utils/get-id-from-mention';
import Command from '../base-command';

export default class SetClass implements Command {
    @hasPermission(PermissionFlagsBits.ManageRoles)
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
        let cls;
        try {
            cls = await ClassFactory.getInstance().getByName(messageAsList.join(' '));
        } catch {
            message.reply(`Não foi encontrada nenhuma classe com o nome **${messageAsList.join(' ')}**.`);
            return;
        }

        await db.transaction(async (trx) => {
            await trx.update(character).set({ characterClass: cls.id }).where(eq(character.id, char.id));

            await trx.delete(completedClassObjective).where(eq(completedClassObjective.characterId, char.id));

            const classObjectives = await trx
                .select()
                .from(classObjective)
                .where(eq(classObjective.classId, char.characterClass!));

            for (const clsObj of classObjectives) {
                await trx.insert(completedClassObjective).values({ characterId: char.id, classObjectiveId: clsObj.id });
            }
        });

        await message.reply(`Classe **${cls.name}** adicionada ao personagem **${char.name}** com sucesso.`);
        return;
    }
}
