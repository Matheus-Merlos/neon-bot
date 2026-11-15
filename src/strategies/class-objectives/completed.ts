import { ChatInputCommandInteraction, Message } from 'discord.js';
import { and, eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, completedClassObjective } from '../../db/schema';
import { CharacterFactory } from '../../factories';
import ClassObjectiveFactory from '../../factories/class-objectives/class-objective-factory';
import { getCharacter } from '../../utils';
import checkCaracterLevelUp from '../../utils/check-character-levelup';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
    objectiveName: string;
};

export default class CompletedClassObjectiveStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const char = await CharacterFactory.getFromPlayerId(input.playerId, replyInstance.guildId!);

        let classObjective;
        try {
            classObjective = await ClassObjectiveFactory.getByName(
                input.objectiveName,
                replyInstance.guildId!,
            );
        } catch {
            replyInstance.reply(
                `Não existe um objetivo de classe com o nome **${input.objectiveName}**`,
            );
            return;
        }

        if (classObjective.classId !== char.characterClass) {
            replyInstance.reply(`O personagem selecionado não possui a classe deste objetivo.`);
            return;
        }

        const [clsObj] = await db
            .select()
            .from(completedClassObjective)
            .where(
                and(
                    eq(completedClassObjective.classObjectiveId, classObjective.id),
                    eq(completedClassObjective.characterId, char.id),
                ),
            );

        if (clsObj.completed) {
            replyInstance.reply(`**${char.name}** já completou este objetivo.`);
            return;
        }

        await checkCaracterLevelUp(replyInstance as Message<true>, char, classObjective.xp);

        await db.transaction(async (trx) => {
            await trx
                .update(completedClassObjective)
                .set({ completed: true })
                .where(
                    and(
                        eq(completedClassObjective.classObjectiveId, classObjective.id),
                        eq(completedClassObjective.characterId, char.id),
                    ),
                );

            await trx
                .update(character)
                .set({ xp: char.xp + classObjective.xp, gold: char.gold + classObjective.gold })
                .where(eq(character.id, char.id));

            replyInstance.reply(`Objetivo completado com sucesso.`);
            return;
        });
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
