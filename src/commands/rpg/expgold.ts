import { Guild } from 'discord.js';
import Command from '../command';
import {
    addPlayerAndCharacterIfNotExists,
    Character,
    getCurrentCharacterFromId,
    getIdFromMention,
} from '../../utils';
import db from '../../models/db';
import { personagem } from '../../models/schema';
import { eq, sql } from 'drizzle-orm';

abstract class AddResource extends Command {
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');
        if (msgArray.length !== 3) {
            this.message.reply('A sintaxe do comando está errada');
            return;
        }

        const mention: string = msgArray[1];
        if (!mention.includes('@')) {
            this.message.reply('O player informado não é um player válido');
            return;
        }

        const id: string = getIdFromMention(mention);
        const quantity: number = parseInt(msgArray[2]);
        if (isNaN(quantity)) {
            this.message.reply('A quantidade informada é inválida');
            return;
        }

        const guild: Guild = this.message.guild!;
        await addPlayerAndCharacterIfNotExists(id, guild);

        await this.add(id, quantity);

        this.message.reply('Adicionado com sucesso!');
    }
    protected abstract add(playerId: string, quantity: number): Promise<void>;
}

export class AddGold extends AddResource {
    protected async add(playerId: string, quantity: number) {
        const character: Character = await getCurrentCharacterFromId(playerId);

        const characterId = character.characterId;

        await db
            .update(personagem)
            .set({ gold: sql`${personagem.gold}+ ${quantity}` })
            .where(eq(personagem.id, characterId));
    }
}

export class AddExp extends AddResource {
    protected async add(playerId: string, quantity: number) {
        const character: Character = await getCurrentCharacterFromId(playerId);

        const characterId = character.characterId;

        await db
            .update(personagem)
            .set({ xp: sql`${personagem.xp}+ ${quantity}` })
            .where(eq(personagem.id, characterId));
    }
}
