import { ChatInputCommandInteraction, Colors, EmbedBuilder, Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import {
    objective,
    objectiveDifficulty,
    selectedObjective as selectedTable,
} from '../../db/schema';
import { CharacterFactory } from '../../factories';
import { getCharacter } from '../../utils';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
};

export default class SelectedObjectivesStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const char = await CharacterFactory.getFromPlayerId(input.playerId, replyInstance.guildId!);

        const selectedObjectives = await db
            .select({
                difficultyName: objectiveDifficulty.name,
                objectiveName: objective.name,
            })
            .from(selectedTable)
            .where(eq(selectedTable.characterId, char.id))
            .innerJoin(objective, eq(selectedTable.objectiveId, objective.id))
            .innerJoin(objectiveDifficulty, eq(objective.type, objectiveDifficulty.id));

        const objectiveEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle(`Objetivos Selecionados de ${char.name}`);

        selectedObjectives.forEach((selectedObjective) => {
            objectiveEmbed.addFields({
                name: selectedObjective.difficultyName,
                value: selectedObjective.objectiveName,
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
