import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../db/db';
import { character, player } from '../../db/schema';
import { getIdFromMention } from '../../utils';
import Command from '../base-command';

export default class AddExp implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        if (!messageAsList[1].includes('@')) {
            await message.reply(`O player "${messageAsList[1]}" não é válido.`);
            return;
        }

        const playerId = getIdFromMention(messageAsList[1]);
        const quantity = parseInt(messageAsList[2]);

        let [char] = await db
            .select()
            .from(character)
            .where(eq(character.player, BigInt(playerId)));
        if (!char) {
            const playerName = (await message.guild!.members.fetch(playerId)).nickname;
            const charName = playerName?.split(' ')[0].replace(',', '');

            await db.insert(player).values({ discordId: BigInt(playerId) });

            [char] = await db
                .insert(character)
                .values({
                    name: charName!,
                    xp: 0,
                    gold: 0,
                    active: true,
                    player: BigInt(playerId),
                })
                .returning();
        }

        await db
            .update(character)
            .set({ xp: char.xp + quantity })
            .where(eq(character.id, char.id));

        await message.reply(`${quantity} de exp adicionado com sucesso para **${char.name}**`);
    }
}
