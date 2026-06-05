import { Message } from 'discord.js';
import { CharacterFactory, ManaAliasFactory } from '../../factories';
import { getCharacter } from '../../utils';
import { EntryNotFoundError } from '../../utils/errors';
import Strategy from '../base-strategy';

export default class UseManaStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const character = await getCharacter(message, messageAsList);

        if (character.currentMana == null) {
            message.reply(`O personagem **${character.name}** não possui mana habilitada.`);
            return;
        }

        const isPercentage = messageAsList[0].includes('%');
        if (isPercentage) {
            const manaToUse = Math.trunc((parseInt(messageAsList[0]) / 100) * character.baseMana!);

            await CharacterFactory.edit(character.id, {
                currentMana: character.currentMana - manaToUse,
            });

            message.reply(
                `**${character.name}** consumiu \`${manaToUse}\` de mana.\nMana atual: \`${character.currentMana - manaToUse}/${character.baseMana}\``,
            );

            return;
        }

        const isAlias = isNaN(parseInt(messageAsList[0]));

        if (!isAlias) {
            const value = parseInt(messageAsList[0]);
            await CharacterFactory.edit(character.id, {
                currentMana: character.currentMana - value,
            });
            message.reply(
                `**${character.name}** consumiu \`${value}\` de mana.\nMana atual: ${character.currentMana - value}/${character.baseMana}`,
            );

            return;
        }

        //Se for um alias...
        try {
            const alias = await ManaAliasFactory.getByName(
                messageAsList.join(' '),
                message.guildId,
            );

            await CharacterFactory.edit(character.id, {
                currentMana: character.currentMana - alias.value,
            });

            message.reply(
                `**${character.name}** consumiu \`${alias.value}\` de mana.\nMana atual: ${character.currentMana - alias.value}/${character.baseMana}`,
            );
        } catch (error) {
            if (error instanceof EntryNotFoundError) {
                message.reply(
                    `Não foi encontrado um alias com o nome **${messageAsList.join(' ')}** no seu personagem.`,
                );
                return;
            }
            message.reply(`Erro encontrado: ${error}`);
        }
        return;
    }
}
