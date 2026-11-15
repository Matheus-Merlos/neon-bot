import { ChatInputCommandInteraction, Colors, EmbedBuilder, Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { completedObjective, objective, objectiveDifficulty } from '../../db/schema';
import { CharacterFactory } from '../../factories';
import { getCharacter } from '../../utils';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
};

export default class ListCompletedObjectivesStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const char = await CharacterFactory.getFromPlayerId(input.playerId, replyInstance.guildId!);

        const completedObjectives = await db
            .select({
                difficultyName: objectiveDifficulty.name,
                objectiveName: objective.name,
            })
            .from(completedObjective)
            .where(eq(completedObjective.characterId, char.id))
            .innerJoin(objective, eq(completedObjective.objectiveId, objective.id))
            .innerJoin(objectiveDifficulty, eq(objective.type, objectiveDifficulty.id));

        const objectiveEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle(`Objetivos concluídos de ${char.name}`);

        completedObjectives.forEach((completed) => {
            objectiveEmbed.addFields({
                name: completed.objectiveName,
                value: completed.difficultyName,
                inline: false,
            });
        });
        replyInstance.reply({ embeds: [objectiveEmbed] });
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
