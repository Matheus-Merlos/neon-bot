import { ChatInputCommandInteraction, Colors, EmbedBuilder, Message } from 'discord.js';
import { asc, eq } from 'drizzle-orm';
import db from '../../db/db';
import { classObjective, completedClassObjective } from '../../db/schema';
import { CharacterFactory } from '../../factories';
import { getCharacter } from '../../utils';
import embedList from '../../utils/embed-list';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
};

export default class ListCompletedClassObjectivesStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const char = await CharacterFactory.getFromPlayerId(input.playerId, replyInstance.guildId!);

        const classObjectives = await db
            .select()
            .from(completedClassObjective)
            .where(eq(completedClassObjective.characterId, char.id))
            .innerJoin(
                classObjective,
                eq(completedClassObjective.classObjectiveId, classObjective.id),
            )
            .orderBy(asc(classObjective.xp));

        if (!classObjectives[0]) {
            replyInstance.reply(
                `Você não possui uma classe selecionada, adicione com o comando \`;set-class\``,
            );
            return;
        }

        await embedList(
            classObjectives,
            5,
            replyInstance,
            (matrix: Array<typeof classObjectives>, currentIndex: number) => {
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
            },
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const input = {
            playerId: interaction.options.getUser('player')?.id ?? interaction.user.id,
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const char = await getCharacter(message, messageAsList);
        await this.handleInput({ playerId: `${char.player}` }, message);
    }
}
