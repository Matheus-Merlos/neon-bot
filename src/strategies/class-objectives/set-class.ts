import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, classObjective, completedClassObjective } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import ClassFactory from '../../factories/class-objectives/class-factory';
import getIdFromMention from '../../utils/get-id-from-mention';
import Strategy from '../base-strategy';

export default class SetClassStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        let char;
        if (messageAsList[0] && messageAsList[0].includes('@')) {
            char = await CharacterFactory.getInstance().getFromPlayerId(getIdFromMention(messageAsList[0]), message.guildId!);
            messageAsList.splice(0, 1);
        } else {
            char = await CharacterFactory.getInstance().getFromPlayerId(message.author.id, message.guildId!);
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
    }
}
