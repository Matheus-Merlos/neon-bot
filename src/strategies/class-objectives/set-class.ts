import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, classObjective, completedClassObjective } from '../../db/schema';
import ClassFactory from '../../factories/class-objectives/class-factory';
import { getCharacter } from '../../utils';
import Strategy from '../base-strategy';

export default class SetClassStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const char = await getCharacter(message, messageAsList);

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
    }
}
