import { and, eq } from 'drizzle-orm';
import db from '../../models/db';
import { personagem, inventario } from '../../models/schema';
import Command from '../command';
import { EmbedBuilder } from 'discord.js';
import { Character, getCurrentCharacterFromId, getIdFromMention } from '../../utils';

type XpAndGold = {
    xp: number;
    gold: number;
};

export default class Inventory extends Command {
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');

        let id: string;
        if (msgArray.length === 1) {
            id = this.message.author.id;
        }
        if (msgArray.length === 2) {
            id = getIdFromMention(msgArray[1]);
        }

        if (![1, 2].includes(msgArray.length)) {
            this.message.reply('Sintaxe do comando errada');
        }

        const character: Character = await getCurrentCharacterFromId(id!);
        const characterFirstName: string = character.characterName.split(' ')[0];

        const characterXpAndGold: XpAndGold = await this.fetchXpAndGold(id!);

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle(`Inventário de ${characterFirstName}:`)
            .setFields(
                { name: 'EXP', value: characterXpAndGold.xp.toString(), inline: true },
                { name: 'Gold', value: characterXpAndGold.gold.toString(), inline: true },
            );

        this.message.reply({ embeds: [embed] });
    }

    public async fetchXpAndGold(playerId: string): Promise<XpAndGold> {
        const resourcesList: Array<XpAndGold> = await db
            .select({
                xp: personagem.xp,
                gold: personagem.gold,
            })
            .from(personagem)
            .where(and(eq(personagem.jogador, BigInt(playerId)), eq(personagem.ativo, true)));

        if (!resourcesList) {
            throw new Error(`Não foi possível encontrar o jogador com o ID ${playerId}`);
        }

        const resources: XpAndGold = resourcesList[0];
        return resources;
    }
}
