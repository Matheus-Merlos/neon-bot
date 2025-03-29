import { Message } from 'discord.js';
import { eq, ExtractTablesWithRelations, InferSelectModel } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import db from '../db/db';
import { character, rank, reachedRank } from '../db/schema';

export default async function checkCaracterLevelUp(
    message: Message,
    char: InferSelectModel<typeof character>,
    quantityAdded: number,
) {
    const ranks = await db.select().from(rank);
    const achievedRanks = (
        await db.select({ id: reachedRank.rankId }).from(reachedRank).where(eq(reachedRank.characterId, char.id))
    ).map((obj) => obj.id);

    for (const rank of ranks) {
        const xp = char.xp + quantityAdded;
        if (xp >= rank.necessaryXp) {
            if (!achievedRanks.includes(rank.id)) {
                await db.insert(reachedRank).values({ characterId: char.id, rankId: rank.id });
                await message.reply(
                    `Parabéns <@${char.player}>, você evoluiu para o rank **${rank.name}**. Seu personagem ganhou **+${rank.extraHabs}** slots de habilidade, e **+${rank.extraAttributes}** pontos de atributo.`,
                );
            }
        }
    }
}

export async function checkCaracterLevelUpTransaction(
    message: Message,
    char: InferSelectModel<typeof character>,
    quantityAdded: number,
    transaction: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>,
) {
    const ranks = await transaction.select().from(rank);
    const achievedRanks = (
        await transaction.select({ id: reachedRank.rankId }).from(reachedRank).where(eq(reachedRank.characterId, char.id))
    ).map((obj) => obj.id);

    for (const rank of ranks) {
        const xp = char.xp + quantityAdded;
        if (xp >= rank.necessaryXp) {
            if (!achievedRanks.includes(rank.id)) {
                await transaction.insert(reachedRank).values({ characterId: char.id, rankId: rank.id });
                await message.reply(
                    `Parabéns <@${char.player}>, você evoluiu para o rank **${rank.name}**. Seu personagem ganhou **+${rank.extraHabs}** slots de habilidade, e **+${rank.extraAttributes}** pontos de atributo.`,
                );
            }
        }
    }
}
