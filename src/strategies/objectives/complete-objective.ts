import { ChatInputCommandInteraction, Message } from 'discord.js';
import { and, eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, completedObjective, selectedObjective } from '../../db/schema';
import { CharacterFactory } from '../../factories';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import { getCharacter } from '../../utils';
import checkCaracterLevelUp from '../../utils/check-character-levelup';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
    objectiveName: string;
};

export default class CompleteObjectiveStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const char = await CharacterFactory.getFromPlayerId(input.playerId, replyInstance.guildId!);

        let objective;
        try {
            objective = await ObjectiveFactory.getByName(
                input.objectiveName,
                replyInstance.guildId!,
            );
        } catch {
            replyInstance.reply(`Não existe um objetivo com o nome **${input.objectiveName}**.`);
            return;
        }

        const selectedObjectives = (
            await db
                .select({ id: selectedObjective.objectiveId })
                .from(selectedObjective)
                .where(eq(selectedObjective.characterId, char.id))
        ).map((obj) => obj.id);

        if (!selectedObjectives.includes(objective.id)) {
            replyInstance.reply(`O jogador mencionado não possui esse objetivo selecionado`);
            return;
        }

        await checkCaracterLevelUp(replyInstance as Message<true>, char, objective.xp);

        await db.transaction(async (trx) => {
            await trx
                .update(character)
                .set({ xp: char.xp + objective.xp, gold: char.gold + objective.gold })
                .where(eq(character.id, char.id));

            await trx
                .delete(selectedObjective)
                .where(
                    and(
                        eq(selectedObjective.objectiveId, objective.id),
                        eq(selectedObjective.characterId, char.id),
                    ),
                );

            await trx
                .insert(completedObjective)
                .values({ characterId: char.id, objectiveId: objective.id });
        });

        await replyInstance.reply(
            `<@${char.player}> você completou o objetivo **${objective.name}**. Agora você pode escolher outro usando o comando \`;choose-objective\``,
        );
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
