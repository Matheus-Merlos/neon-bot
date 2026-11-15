import { ChatInputCommandInteraction, Message } from 'discord.js';
import { CharacterFactory } from '../../factories';
import { getCharacter } from '../../utils';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
    value: string;
};

export default class ManaRegenStrategy implements IStrategy<Input> {
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

        if (character.currentMana == character.baseMana) {
            replyInstance.reply(`O personagem **${character.name}** já está com a mana cheia.`);
            return;
        }

        if (input.value === 'full') {
            await CharacterFactory.edit(character.id, { currentMana: character.baseMana });
            replyInstance.reply(
                `Mana de **${character.name}** completamente regenerada.\nMana atual: \`${character.baseMana}/${character.baseMana}\``,
            );
            return;
        }

        const isPercentage = input.value.includes('%');
        if (isPercentage) {
            const manaToRegen = Math.trunc((parseInt(input.value) / 100) * character.baseMana!);
            const novaMana = Math.min(character.currentMana + manaToRegen, character.baseMana!);

            await CharacterFactory.edit(character.id, { currentMana: novaMana });

            replyInstance.reply(
                `**${character.name}** regenerou \`${manaToRegen}\` de mana.\nMana atual: \`${novaMana}/${character.baseMana}\``,
            );
            return;
        }

        const value = parseInt(input.value);
        const novaMana = Math.min(character.currentMana + value, character.baseMana!);

        await CharacterFactory.edit(character.id, { currentMana: novaMana });

        replyInstance.reply(
            `**${character.name}** regenerou \`${value}\` de mana.\nMana atual: \`${novaMana}/${character.baseMana}\``,
        );
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
            { playerId: `${character.player}`, value: messageAsList[0] },
            message,
        );
    }
}
