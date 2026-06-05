import { Message } from 'discord.js';
import { CharacterFactory } from '../../factories';
import { getCharacter } from '../../utils';
import Strategy from '../base-strategy';

export default class ManaRegenStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const character = await getCharacter(message, messageAsList);

        if (character.currentMana == null) {
            message.reply(`O personagem **${character.name}** não possui mana habilitada.`);
            return;
        }

        if (character.currentMana == character.baseMana) {
            message.reply(`O personagem **${character.name}** já está com a mana cheia.`);
            return;
        }

        if (messageAsList[0] == 'full') {
            await CharacterFactory.edit(character.id, { currentMana: character.baseMana });
            message.reply(
                `Mana de **${character.name}** completamente regenerada.\nMana atual: \`${character.baseMana}/${character.baseMana}\``,
            );
            return;
        }

        const isPercentage = messageAsList[0].includes('%');
        if (isPercentage) {
            const manaToRegen = Math.trunc(
                (parseInt(messageAsList[0]) / 100) * character.baseMana!,
            );

            const novaMana = Math.min(character.currentMana + manaToRegen, character.baseMana!);

            await CharacterFactory.edit(character.id, {
                currentMana: novaMana,
            });

            message.reply(
                `**${character.name}** regenerou \`${manaToRegen}\` de mana.\nMana atual: \`${novaMana}/${character.baseMana}\``,
            );

            return;
        }

        const value = parseInt(messageAsList[0]);
        const novaMana = Math.min(character.currentMana + value, character.baseMana!);

        await CharacterFactory.edit(character.id, {
            currentMana: novaMana,
        });

        message.reply(
            `**${character.name}** regenerou \`${novaMana}\` de mana.\nMana atual: \`${novaMana}/${character.baseMana}\``,
        );

        return;
    }
}
