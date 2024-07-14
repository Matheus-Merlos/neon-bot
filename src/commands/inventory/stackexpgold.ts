import { eq, sql } from 'drizzle-orm';
import { personagem } from '../../models/schema';
import {
    addPlayerAndCharacterIfNotExists,
    Character,
    getCurrentCharacterFromId,
    getIdFromMention,
} from '../../utils';
import { Command } from '../command';
import db from '../../models/db';
import { Guild, Message } from 'discord.js';

abstract class StackAddResource implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray: Array<string> = message.content.split(' ');

        if (!(msgArray.length > 2)) {
            message.reply('Sintaxe do comando errada!');
            return;
        }

        const quantity: number = parseInt(msgArray[1]);
        if (isNaN(quantity)) {
            message.reply('Quantidade inválida');
        }

        const idList: Array<string> = msgArray
            .slice(2)
            .filter((mention: string) => mention.includes('@'))
            .map((mention: string) => getIdFromMention(mention));

        const guild: Guild = message.guild!;
        idList.forEach(async (id: string) => {
            await addPlayerAndCharacterIfNotExists(id, guild);
            await this.add(id, quantity, message);
        });
    }
    protected abstract add(playerId: string, quantity: number, message: Message): Promise<void>;
}

export class StackAddGold extends StackAddResource {
    protected async add(playerId: string, quantity: number, message: Message) {
        const character: Character = await getCurrentCharacterFromId(playerId);

        const characterId = character.characterId;

        await db
            .update(personagem)
            .set({ gold: sql`${personagem.gold}+ ${quantity}` })
            .where(eq(personagem.id, characterId));

        message.channel.send(
            `${quantity} de gold adicionado com sucesso para **${character.characterName}**!`,
        );
    }
}

export class StackAddExp extends StackAddResource {
    protected async add(playerId: string, quantity: number, message: Message) {
        const character: Character = await getCurrentCharacterFromId(playerId);

        const characterId = character.characterId;

        await db
            .update(personagem)
            .set({ xp: sql`${personagem.xp}+ ${quantity}` })
            .where(eq(personagem.id, characterId));

        message.channel.send(
            `${quantity} de xp adicionado com sucesso para **${character.characterName}**!`,
        );
    }
}
