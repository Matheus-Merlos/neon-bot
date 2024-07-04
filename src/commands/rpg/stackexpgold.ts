import { eq, sql } from 'drizzle-orm';
import { personagem } from '../../models/schema';
import {
    addPlayerAndCharacterIfNotExists,
    Character,
    getCurrentCharacterFromId,
    getIdFromMention,
} from '../../utils';
import Command from '../command';
import db from '../../models/db';
import { Guild } from 'discord.js';

abstract class StackAddResource extends Command {
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');

        if (!(msgArray.length > 2)) {
            this.message.reply('Sintaxe do comando errada!');
            return;
        }

        const quantity: number = parseInt(msgArray[1]);
        if (isNaN(quantity)) {
            this.message.reply('Quantidade inválida');
        }

        const idList: Array<string> = msgArray
            .slice(2)
            .filter((mention: string) => mention.includes('@'))
            .map((mention: string) => getIdFromMention(mention));

        const guild: Guild = this.message.guild!;
        idList.forEach(async (id: string) => {
            await addPlayerAndCharacterIfNotExists(id, guild);
            await this.add(id, quantity);
        });
    }
    protected abstract add(playerId: string, quantity: number): Promise<void>;
}

export class StackAddGold extends StackAddResource {
    protected async add(playerId: string, quantity: number) {
        const character: Character = await getCurrentCharacterFromId(playerId);

        const characterId = character.characterId;

        await db
            .update(personagem)
            .set({ gold: sql`${personagem.gold}+ ${quantity}` })
            .where(eq(personagem.id, characterId));

        this.message.channel.send(
            `${quantity} de gold adicionado com sucesso para **${character.characterName}**!`,
        );
    }
}

export class StackAddExp extends StackAddResource {
    protected async add(playerId: string, quantity: number) {
        const character: Character = await getCurrentCharacterFromId(playerId);

        const characterId = character.characterId;

        await db
            .update(personagem)
            .set({ xp: sql`${personagem.xp}+ ${quantity}` })
            .where(eq(personagem.id, characterId));

        this.message.channel.send(
            `${quantity} de xp adicionado com sucesso para **${character.characterName}**!`,
        );
    }
}
