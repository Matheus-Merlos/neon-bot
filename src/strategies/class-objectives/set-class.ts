import { ChatInputCommandInteraction, Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, classObjective, completedClassObjective } from '../../db/schema';
import { CharacterFactory } from '../../factories';
import ClassFactory from '../../factories/class-objectives/class-factory';
import { getCharacter } from '../../utils';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
    className: string;
};

export default class SetClassStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const char = await CharacterFactory.getFromPlayerId(input.playerId, replyInstance.guildId!);

        let cls;
        try {
            cls = await ClassFactory.getByName(input.className, replyInstance.guildId!);
        } catch {
            replyInstance.reply(
                `Não foi encontrada nenhuma classe com o nome **${input.className}**.`,
            );
            return;
        }

        await db.transaction(async (trx) => {
            await trx
                .update(character)
                .set({ characterClass: cls.id })
                .where(eq(character.id, char.id));

            await trx
                .delete(completedClassObjective)
                .where(eq(completedClassObjective.characterId, char.id));

            const classObjectives = await trx
                .select()
                .from(classObjective)
                .where(eq(classObjective.classId, cls.id));

            for (const clsObj of classObjectives) {
                await trx
                    .insert(completedClassObjective)
                    .values({ characterId: char.id, classObjectiveId: clsObj.id });
            }
        });

        await replyInstance.reply(
            `Classe **${cls.name}** adicionada ao personagem **${char.name}** com sucesso.`,
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            playerId: o.getUser('player')?.id ?? interaction.user.id,
            className: o.getString('name', true),
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const char = await getCharacter(message, messageAsList);
        const className = messageAsList.join(' ');

        await this.handleInput({ playerId: `${char.player}`, className }, message);
    }
}
