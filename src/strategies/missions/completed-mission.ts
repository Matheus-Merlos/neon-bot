import { ChatInputCommandInteraction, Message, User } from 'discord.js';
import { InferSelectModel, eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, missionComplete, mission as missionTable } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import MissionFactory from '../../factories/missions/mission-factory';
import { checkCaracterLevelUpTransaction } from '../../utils/check-character-levelup';
import { EntryNotFoundError } from '../../utils/errors';
import getIdFromMention from '../../utils/get-id-from-mention';
import { IStrategy } from '../base-strategy';

type Input = {
    missionName: string;
    playerIds: string[];
};

export default class CompletedMissionStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        let mission;
        try {
            mission = await MissionFactory.getByName(input.missionName, replyInstance.guildId!);
        } catch (e) {
            if (e instanceof EntryNotFoundError) {
                replyInstance.reply(
                    `Não foi encontrado uma missão com o nome **${input.missionName}**`,
                );
            }
            return;
        }

        const chars: Array<InferSelectModel<typeof character>> = [];
        for (const playerId of input.playerIds) {
            chars.push(await CharacterFactory.getFromPlayerId(playerId, replyInstance.guildId!));
        }

        await db.transaction(async (trx) => {
            await trx
                .update(missionTable)
                .set({ completed: false })
                .where(eq(missionTable.id, mission.id));

            for (const char of chars) {
                await checkCaracterLevelUpTransaction(
                    replyInstance as Message<true>,
                    char,
                    mission.xp,
                    trx,
                );

                await trx
                    .update(character)
                    .set({ xp: char.xp + mission.xp, gold: char.gold + mission.gold })
                    .where(eq(character.id, char.id));

                await trx
                    .insert(missionComplete)
                    .values({ characterId: char.id, missionId: mission.id });
            }
        });

        replyInstance.reply(
            `Missão **${mission.name}** completada com sucesso por **${chars.map((char) => char.name).join(', ')}**`,
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const players: User[] = [];
        for (let i = 1; i <= 10; i++) {
            const player = o.getUser(`player${i}`);
            if (player) players.push(player);
        }

        if (players.length === 0) {
            interaction.reply('Você precisa mencionar pelo menos um jogador.');
            return;
        }

        const input = {
            missionName: o.getString('name', true),
            playerIds: players.map((p) => p.id),
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const firstMentionIndex = messageAsList.findIndex((entry) => entry.includes('@'));

        const missionName = messageAsList.slice(0, firstMentionIndex).join(' ');
        const mentions = messageAsList.slice(firstMentionIndex, messageAsList.length);
        const playerIds = mentions.map((mention) => getIdFromMention(mention));

        await this.handleInput({ missionName, playerIds }, message);
    }
}
