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
import { eq } from 'drizzle-orm';

export default class AddGold extends Command {
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
        }

        const guild: Guild = this.message.guild!;
        addPlayerAndCharacterIfNotExists(id, guild)
            .then(async () => {
                await this.add(id, quantity);
                this.message.reply('Gold adicionado com sucesso!');
            })
            .catch((error: Error) => {
                this.message.reply(`Houve um herro ao incluir o jogador: ${error.message}`);
            });
    }
    private async add(playerId: string, quantity: number) {
        const character: Character = await getCurrentCharacterFromId(playerId);

        const characterId = character.characterId;

        await db.update(personagem).set({ gold: quantity }).where(eq(personagem.id, characterId));
    }
}
