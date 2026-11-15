import { ChatInputCommandInteraction, Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { completedObjective, objective, selectedObjective } from '../../db/schema';
import { CharacterFactory } from '../../factories';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import { getCharacter } from '../../utils';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
    objectiveName: string;
};

export default class SelectObjectiveStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const char = await CharacterFactory.getFromPlayerId(input.playerId, replyInstance.guildId!);

        let objectiveToSelect;
        try {
            objectiveToSelect = await ObjectiveFactory.getByName(
                input.objectiveName,
                replyInstance.guildId!,
            );
        } catch {
            replyInstance.reply(`Não existe um objetivo com o nome **${input.objectiveName}**.`);
            return;
        }

        const alreadyCompletedObjectives = (
            await db
                .select({ id: completedObjective.objectiveId })
                .from(completedObjective)
                .where(eq(completedObjective.characterId, char.id))
        ).map((obj) => obj.id);

        if (alreadyCompletedObjectives.includes(objectiveToSelect.id)) {
            replyInstance.reply(`Você já concluiu esse objetivo anteriormente.`);
            return;
        }

        const alreadySelectedObjectives = (
            await db
                .select({ difficultyId: objective.type })
                .from(selectedObjective)
                .where(eq(selectedObjective.characterId, char.id))
                .innerJoin(objective, eq(selectedObjective.objectiveId, objective.id))
        ).map((obj) => obj.difficultyId);

        if (alreadySelectedObjectives.includes(objectiveToSelect.type)) {
            replyInstance.reply(`Você já tem um objetivo dessa dificuldade selecionado.`);
            return;
        }

        await db
            .insert(selectedObjective)
            .values({ characterId: char.id, objectiveId: objectiveToSelect.id });
        replyInstance.reply(`Objetivo **${objectiveToSelect.name}** selecionado com sucesso.`);
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            playerId: o.getUser('player')?.id ?? interaction.user.id,
            objectiveName: o.getString('name', true),
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const char = await getCharacter(message, messageAsList);
        const objectiveName = messageAsList.join(' ');

        await this.handleInput({ playerId: `${char.player}`, objectiveName }, message);
    }
}
