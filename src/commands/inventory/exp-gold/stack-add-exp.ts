import { Message, PermissionsBitField } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { character, rank, reachedRank } from '../../../db/schema';
import hasPermission from '../../../decorators/has-permission';
import CharacterFactory from '../../../factories/character-factory';
import getIdFromMention from '../../../utils/get-id-from-mention';
import Command from '../../base-command';

export default class StackAddExp implements Command {
    @hasPermission(PermissionsBitField.Flags.ManageRoles)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const quantity = parseInt(messageAsList[1]);

        messageAsList.splice(0, 2);

        const playersId = messageAsList.map((mention) => getIdFromMention(mention));
        const characters = [];
        for (const playerId of playersId) {
            characters.push(await CharacterFactory.getFromId(playerId, message));
        }

        const ranks = await db.select().from(rank);

        for (const char of characters) {
            const achievedRanks = (
                await db
                    .select({ id: reachedRank.rankId })
                    .from(reachedRank)
                    .where(eq(reachedRank.characterId, char.id))
            ).map((obj) => obj.id);

            ranks.forEach(async (rank) => {
                const xp = char.xp + quantity;
                if (xp >= rank.necessaryXp) {
                    if (!achievedRanks.includes(rank.id)) {
                        await db
                            .insert(reachedRank)
                            .values({ characterId: char.id, rankId: rank.id });
                        await message.reply(
                            `Parabéns <@${char.player}>, você evoluiu para o rank **${rank.name}**. Seu personagem ganhou **+${rank.extraHabs}** slots de habilidade, e **+${rank.extraAttributes}** pontos de atributo.`,
                        );
                    }
                }
            });

            await db
                .update(character)
                .set({ xp: char.xp + quantity })
                .where(eq(character.id, char.id));

            await message.reply(`${quantity} de exp adicionado com sucesso para **${char.name}**`);
        }
    }
}
