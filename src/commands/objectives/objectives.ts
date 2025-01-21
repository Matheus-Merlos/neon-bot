import { Colors, EmbedBuilder, Message } from 'discord.js';
import { InferSelectModel } from 'drizzle-orm';
import { objective } from '../../db/schema';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import embedList from '../../utils/embed-list';
import Command from '../base-command';

export default class Objectives implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const objectives = await ObjectiveFactory.getInstance().getAll();

        await embedList(
            objectives,
            5,
            message,
            (objectives: Array<Array<InferSelectModel<typeof objective>>>, currentIndex: number) => {
                const objectiveEmbed = new EmbedBuilder()
                    .setTitle('Objetivos')
                    .setColor(Colors.Blue)
                    .setFooter({ text: `Página ${currentIndex + 1}/${objectives.length}` });

                objectives[currentIndex].forEach((objective) => {
                    objectiveEmbed.addFields(
                        {
                            name: objective.name,
                            value: `XP: ${objective.xp}, dinheiro: ${objective.gold}`,
                            inline: false,
                        },
                        {
                            name: ' ',
                            value: ' ',
                            inline: false,
                        },
                    );
                });

                return objectiveEmbed;
            },
        );
    }
}
