import { ChatInputCommandInteraction, Message } from 'discord.js';
import { CharacterFactory, ManaAliasFactory } from '../../factories';
import { getCharacter } from '../../utils';
import { EntryNotFoundError } from '../../utils/errors';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
    value: string;
};

export default class UseManaStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const character = await CharacterFactory.getFromPlayerId(
            input.playerId,
            replyInstance.guildId!,
        );

        if (character.currentMana == null) {
            replyInstance.reply(`O personagem **${character.name}** não possui mana habilitada.`);
            return;
        }

        const isPercentage = input.value.includes('%');
        if (isPercentage) {
            const manaToUse = Math.trunc((parseInt(input.value) / 100) * character.baseMana!);

            await CharacterFactory.edit(character.id, {
                currentMana: character.currentMana - manaToUse,
            });

            replyInstance.reply(
                `**${character.name}** consumiu \`${manaToUse}\` de mana.\nMana atual: \`${character.currentMana - manaToUse}/${character.baseMana}\``,
            );
            return;
        }

        const isAlias = isNaN(parseInt(input.value));

        if (!isAlias) {
            const value = parseInt(input.value);
            await CharacterFactory.edit(character.id, {
                currentMana: character.currentMana - value,
            });
            replyInstance.reply(
                `**${character.name}** consumiu \`${value}\` de mana.\nMana atual: ${character.currentMana - value}/${character.baseMana}`,
            );
            return;
        }

        try {
            const alias = await ManaAliasFactory.getByName(input.value, replyInstance.guildId!);

            await CharacterFactory.edit(character.id, {
                currentMana: character.currentMana - alias.value,
            });

            replyInstance.reply(
                `**${character.name}** consumiu \`${alias.value}\` de mana.\nMana atual: ${character.currentMana - alias.value}/${character.baseMana}`,
            );
        } catch (error) {
            if (error instanceof EntryNotFoundError) {
                replyInstance.reply(
                    `Não foi encontrado um alias com o nome **${input.value}** no seu personagem.`,
                );
                return;
            }
            replyInstance.reply(`Erro encontrado: ${error}`);
        }
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            playerId: o.getUser('player')?.id ?? interaction.user.id,
            value: o.getString('value', true),
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const character = await getCharacter(message, messageAsList);
        await this.handleInput(
            { playerId: `${character.player}`, value: messageAsList.join(' ') },
            message,
        );
    }
}
