import { ChatInputCommandInteraction, Message } from 'discord.js';
import { CharacterFactory } from '../../factories';
import { getCharacter } from '../../utils';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
    baseMana: number;
};

export default class SetBaseManaStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const character = await CharacterFactory.getFromPlayerId(
            input.playerId,
            replyInstance.guildId!,
        );

        await CharacterFactory.edit(character.id, {
            baseMana: input.baseMana,
            currentMana: input.baseMana,
        });
        replyInstance.reply(
            `Mana base de **${character.name}** atualizada: \`${input.baseMana}\`.`,
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            playerId: o.getUser('player')?.id ?? interaction.user.id,
            baseMana: o.getNumber('value', true),
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const character = await getCharacter(message, messageAsList);
        const baseMana = parseInt(messageAsList[0]);

        if (isNaN(baseMana)) {
            message.reply(
                `Ops! O valor \`${messageAsList[0]}\` não é um número válido.\nPor favor, tente novamente enviando apenas o valor numérico, por exemplo: \`100\`.`,
            );
            return;
        }

        await this.handleInput({ playerId: `${character.player}`, baseMana }, message);
    }
}
