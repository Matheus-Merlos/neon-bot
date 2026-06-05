import { Message } from 'discord.js';
import { CharacterFactory } from '../../factories';
import { getCharacter } from '../../utils';
import Strategy from '../base-strategy';

export default class SetBaseManaStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const character = await getCharacter(message, messageAsList);

        const baseMana = parseInt(messageAsList[0]);

        if (isNaN(baseMana)) {
            message.reply(
                `Ops! O valor \`${messageAsList[0]}\` não é um número válido.\nPor favor, tente novamente enviando apenas o valor numérico, por exemplo: \`100\`.`,
            );
            return;
        }

        await CharacterFactory.edit(character.id, { baseMana, currentMana: baseMana });
        message.reply(`Mana base de **${character.name}** atualizada: \`${baseMana}\`.`);
        return;
    }
}
