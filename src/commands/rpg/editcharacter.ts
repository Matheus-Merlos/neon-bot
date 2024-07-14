import { getCharacterNameFromId, getIdFromMention } from '../../utils';
import { Command } from '../command';
import db from '../../models/db';
import { personagem } from '../../models/schema';
import { eq } from 'drizzle-orm';
import { Message } from 'discord.js';

export default class EditCharacter implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray: Array<string> = message.content.split(' ');

        let id: string;
        let characterName: string;
        if (msgArray.length === 1) {
            id = message.author.id;
            characterName = await getCharacterNameFromId(id, message.guild!);
        } else if (msgArray.length === 2 && msgArray[1].includes('@')) {
            id = getIdFromMention(msgArray[1]);
            characterName = await getCharacterNameFromId(id, message.guild!);
        } else if (msgArray.length === 2) {
            id = message.author.id;
            characterName = msgArray[1];
        } else if (msgArray.length > 2 && msgArray[1].includes('@')) {
            id = getIdFromMention(msgArray[1]);
            characterName = msgArray.slice(2).join(' ');
        } else {
            id = message.author.id;
            characterName = msgArray.slice(1).join(' ');
        }

        await this.changeCharacter(id, characterName);

        await message.reply('Personagem alterado com sucesso!');
    }

    private async changeCharacter(playerId: string, newCharacterName: string): Promise<void> {
        await db
            .update(personagem)
            .set({ nome: newCharacterName })
            .where(eq(personagem.jogador, BigInt(playerId)));
    }
}
