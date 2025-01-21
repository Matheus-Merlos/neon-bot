import { Colors, EmbedBuilder, Message } from 'discord.js';
import { asc, eq } from 'drizzle-orm';
import db from '../../db/db';
import { characterClass, classObjective } from '../../db/schema';
import embedList from '../../utils/embed-list';
import Command from '../base-command';

export default class ClassObjectives implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const classObjectives = await db
            .select({
                className: characterClass.name,
                objectiveName: classObjective.name,
                xp: classObjective.xp,
                gold: classObjective.gold,
            })
            .from(classObjective)
            .innerJoin(characterClass, eq(classObjective.classId, characterClass.id))
            .orderBy(asc(classObjective.xp));

        if (!classObjectives[0]) {
            message.reply(`Você não possui uma classe selecionada, adicione com o comando \`;set-class\``);
            return;
        }

        await embedList(classObjectives, 5, message, (matrix: Array<typeof classObjectives>, currentIndex: number) => {
            const embed = new EmbedBuilder()
                .setTitle(`Objetivos de classe do ${message.guild!.name}`)
                .setColor(Colors.DarkAqua)
                .setFooter({ text: `Página ${currentIndex + 1}/${matrix.length}` });

            matrix[currentIndex].forEach((clsObj) => {
                embed.addFields({
                    name: `${clsObj.className} - ${clsObj.objectiveName}`,
                    value: `XP: ${clsObj.xp}; Dinheiro: ${clsObj.gold}`,
                });
            });

            return embed;
        });
    }
}
