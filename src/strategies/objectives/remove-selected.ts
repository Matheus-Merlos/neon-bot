import { ChatInputCommandInteraction, Message } from 'discord.js';
import { and, eq } from 'drizzle-orm';
import db from '../../db/db';
import { completedObjective, selectedObjective } from '../../db/schema';
import { CharacterFactory, ObjectiveFactory } from '../../factories';
import { getCharacter } from '../../utils';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
    objectiveName: string;
};

export default class RemoveSelectedObjectiveStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const char = await CharacterFactory.getFromPlayerId(input.playerId, replyInstance.guildId!);

        let objectiveToRemove;
        try {
            objectiveToRemove = await ObjectiveFactory.getByName(
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

        if (alreadyCompletedObjectives.includes(objectiveToRemove.id)) {
            replyInstance.reply(
                `Você já concluiu esse objetivo anteriormente. Tá querendo remover por que?`,
            );
            return;
        }

        const alreadySelectedObjectives = await db
            .select()
            .from(selectedObjective)
            .where(
                and(
                    eq(selectedObjective.characterId, char.id),
                    eq(selectedObjective.objectiveId, objectiveToRemove.id),
                ),
            );

        if (!alreadySelectedObjectives[0]) {
            replyInstance.reply(`Você não possui esse objetivo selecionado.`);
            return;
        }

        await db
            .delete(selectedObjective)
            .where(
                and(
                    eq(selectedObjective.characterId, char.id),
                    eq(selectedObjective.objectiveId, objectiveToRemove.id),
                ),
            );
        replyInstance.reply(`Objetivo **${objectiveToRemove.name}** de-selecionado com sucesso.`);
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
