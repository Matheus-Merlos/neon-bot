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
        messageAsList.splice(0, 1);
        let char;
        if (messageAsList[0].includes('@')) {
            char = await CharacterFactory.getInstance().getFromPlayerId(getIdFromMention(messageAsList[0]), message.guild!.id);
            messageAsList.splice(0, 1);
        } else {
            char = await CharacterFactory.getInstance().getFromPlayerId(message.author.id, message.guild!.id);
        }

        let cls;
        try {
            cls = await ClassFactory.getInstance().getByName(messageAsList.join(' '), message.guildId!);
        } catch {
            message.reply(`Não foi encontrada nenhuma classe com o nome **${messageAsList.join(' ')}**.`);
            return;
        }

        await db.transaction(async (trx) => {
            await trx.update(character).set({ characterClass: cls.id }).where(eq(character.id, char.id));

            await trx.delete(completedClassObjective).where(eq(completedClassObjective.characterId, char.id));

            const classObjectives = await trx.select().from(classObjective).where(eq(classObjective.classId, cls.id));

            for (const clsObj of classObjectives) {
                await trx.insert(completedClassObjective).values({ characterId: char.id, classObjectiveId: clsObj.id });
            }
        });

        await message.reply(`Classe **${cls.name}** adicionada ao personagem **${char.name}** com sucesso.`);
        return;
    }
}
