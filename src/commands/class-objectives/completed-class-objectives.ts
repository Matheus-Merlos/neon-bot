import { Colors, EmbedBuilder, Message } from 'discord.js';
import { asc, eq } from 'drizzle-orm';
import db from '../../db/db';
import { classObjective, completedClassObjective } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import embedList from '../../utils/embed-list';
import getIdFromMention from '../../utils/get-id-from-mention';
import Command from '../base-command';

export default class CompletedClassObjectives implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        let char;
        if (messageAsList[1]) {
            char = await CharacterFactory.getFromId(getIdFromMention(messageAsList[1]), message);
            messageAsList.splice(0, 1);
        } else {
            char = await CharacterFactory.getFromId(message.author.id, message);
        }

        const classObjectives = await db
            .select()
            .from(completedClassObjective)
            .where(eq(completedClassObjective.characterId, char.id))
            .innerJoin(classObjective, eq(completedClassObjective.classObjectiveId, classObjective.id))
            .orderBy(asc(classObjective.xp));

        if (!classObjectives[0]) {
            message.reply(`Você não possui uma classe selecionada, adicione com o comando \`;set-class\``);
            return;
        }

        await embedList(classObjectives, 5, message, (matrix: Array<typeof classObjectives>, currentIndex: number) => {
            const embed = new EmbedBuilder()
                .setTitle(`Objetivos de classe de ${char.name}`)
                .setColor(Colors.DarkAqua)
                .setFooter({ text: `Página ${currentIndex + 1}/${matrix.length}` });

            matrix[currentIndex].forEach((clsObj) => {
                embed.addFields({
                    name: `${clsObj.completed_class_objective.completed ? ':white_check_mark:' : ':x:'} - ${clsObj.class_objective.name}`,
                    value: `XP: ${clsObj.class_objective.xp}; Dinheiro: ${clsObj.class_objective.gold}`,
                });
            });

            return embed;
        });
    }
}
