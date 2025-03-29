import { Message } from 'discord.js';
import { InferSelectModel, eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, missionComplete, mission as missionTable } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import MissionFactory from '../../factories/missions/mission-factory';
import { checkCaracterLevelUpTransaction } from '../../utils/check-character-levelup';
import { EntryNotFoundError } from '../../utils/errors';
import getIdFromMention from '../../utils/get-id-from-mention';
import Strategy from '../base-strategy';

export default class CompletedMissionStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const firstMentionIndex = messageAsList.findIndex((entry) => entry.includes('@'));

        const missionName = messageAsList.slice(0, firstMentionIndex).join(' ');
        let mission;
        try {
            mission = await MissionFactory.getByName(missionName, message.guildId!);
        } catch (e) {
            if (e instanceof EntryNotFoundError) {
                message.reply(`Não foi encontrado uma missão com o nome **${missionName}**`);
            }
            return;
        }

        const mentions = messageAsList.slice(firstMentionIndex, messageAsList.length);
        const chars: Array<InferSelectModel<typeof character>> = [];
        for (const mention of mentions) {
            chars.push(await CharacterFactory.getFromPlayerId(getIdFromMention(mention), message.guildId!));
        }

        await db.transaction(async (trx) => {
            await trx.update(missionTable).set({ completed: false }).where(eq(missionTable.id, mission.id));

            for (const char of chars) {
                await checkCaracterLevelUpTransaction(message, char, mission.xp, trx);

                await trx
                    .update(character)
                    .set({ xp: char.xp + mission.xp, gold: char.gold + mission.gold })
                    .where(eq(character.id, char.id));

                await trx.insert(missionComplete).values({ characterId: char.id, missionId: mission.id });
            }
        });

        message.reply(`Missão **${mission.name}** completada com sucesso por **${chars.map((char) => char.name).join(', ')}**`);
    }
}
