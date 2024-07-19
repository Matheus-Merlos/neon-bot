import { Command } from '../command';
import { EmbedBuilder, Message } from 'discord.js';
import { addPlayerAndCharacterIfNotExists, getIdFromMention } from '../../utils';
import { Character, CharacterFactory, InventoryItem } from './character';

export default class Inventory implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray: Array<string> = message.content.split(' ');

        let id: string;
        if (msgArray.length === 1) {
            id = message.author.id;
        }
        if (msgArray.length === 2) {
            id = getIdFromMention(msgArray[1]);
        }

        if (![1, 2].includes(msgArray.length)) {
            message.reply('Sintaxe do comando errada');
        }

        await addPlayerAndCharacterIfNotExists(id!, message.guild!);

        const character: Character = await CharacterFactory.retrieveFromId(BigInt(id!));
        const characterFirstName: string = character.characterName.split(' ')[0];

        const characterItems: Array<InventoryItem> = await character.inventory;

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle(`Inventário de ${characterFirstName}:`)
            .setFields(
                { name: 'EXP', value: character.xp.toString(), inline: true },
                { name: 'Gold', value: character.money.toString(), inline: true },
                ...characterItems.map((item: InventoryItem) => ({
                    name: `- ${item.name} [${item.quantity}]`,
                    value: item.description,
                    inline: false,
                })),
            );

        message.reply({ embeds: [embed] });
    }
}
