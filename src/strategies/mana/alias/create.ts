import { Message } from 'discord.js';
import { ManaAliasFactory } from '../../../factories';
import { getCharacter } from '../../../utils';
import Strategy from '../../base-strategy';

export default class CreateManaAliasStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const character = await getCharacter(message, messageAsList);

        const value = parseInt(messageAsList[0]);
        messageAsList.splice(0, 1);
        const aliasName = messageAsList.join(' ');

        if (isNaN(value)) {
            message.reply(
                `Ops! O valor \`${messageAsList[0]}\` não é um número válido.\nPor favor, tente novamente enviando apenas o valor numérico, por exemplo: \`100\`.`,
            );
            return;
        }

        if (!aliasName) {
            message.reply(
                `Ops! O nome do *alias* não é valido.\nPor favor, tente novamente enviando um nome após o número específico.`,
            );
            return;
        }

        const createdAlias = await ManaAliasFactory.create({
            name: aliasName,
            value,
            character: character.id,
            guildId: BigInt(message.guildId),
        });

        message.reply(
            `Alias **${createdAlias.name}** criado para o personagem **${character.name}** com o valor de **${value}** de mana.`,
        );
        return;
    }
}
