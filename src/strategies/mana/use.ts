import { ChatInputCommandInteraction, Message } from 'discord.js';
import { CharacterFactory, ManaAliasFactory } from '../../factories';
import { getCharacter } from '../../utils';
import { EntryNotFoundError } from '../../utils/errors';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
    values: Array<string>;
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

        let totalManaUsed = 0;
        const usedValues: string[] = [];

        for (const value of input.values) {
            const isPercentage = value.includes('%');
            if (isPercentage) {
                const manaToUse = Math.trunc((parseInt(value) / 100) * character.baseMana!);
                totalManaUsed += manaToUse;
                usedValues.push(`${value} (${manaToUse})`);
                continue;
            }

            const isAlias = isNaN(parseInt(value));

            if (!isAlias) {
                const numValue = parseInt(value);
                totalManaUsed += numValue;
                usedValues.push(`${numValue}`);
                continue;
            }

            try {
                const alias = await ManaAliasFactory.getByName(value, replyInstance.guildId!);
                totalManaUsed += alias.value;
                usedValues.push(`${value} (${alias.value})`);
            } catch (error) {
                if (error instanceof EntryNotFoundError) {
                    replyInstance.reply(
                        `Não foi encontrado um alias com o nome **${value}** no seu personagem.`,
                    );
                    return;
                }
                replyInstance.reply(`Erro encontrado: ${error}`);
                return;
            }
        }

        await CharacterFactory.edit(character.id, {
            currentMana: character.currentMana - totalManaUsed,
        });

        const valuesDisplay = usedValues.join(' + ');
        replyInstance.reply(
            `**${character.name}** consumiu \`${valuesDisplay}\` = \`${totalManaUsed}\` de mana.\nMana atual: \`${character.currentMana - totalManaUsed}/${character.baseMana}\``,
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const values: string[] = [];
        for (let i = 1; i <= 10; i++) {
            const value = o.getString(`value${i}`);
            if (value) values.push(value);
        }

        const input = {
            playerId: o.getUser('player')?.id ?? interaction.user.id,
            values,
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const character = await getCharacter(message, messageAsList);
        await this.handleInput({ playerId: `${character.player}`, values: messageAsList }, message);
    }
}
