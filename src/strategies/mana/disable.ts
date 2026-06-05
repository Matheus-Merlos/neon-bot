import { Message } from 'discord.js';
import { CharacterFactory } from '../../factories';
import { getCharacter } from '../../utils';
import Strategy from '../base-strategy';

export default class DisableCharacterManaStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const character = await getCharacter(message, messageAsList);

        await CharacterFactory.edit(character.id, { baseMana: null, currentMana: null });
        message.reply(`Mana desabilitada para o personagem **${character.name}**.`);
        return;
    }
}
