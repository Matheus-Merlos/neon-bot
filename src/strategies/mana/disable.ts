import { ChatInputCommandInteraction, Message } from 'discord.js';
import { CharacterFactory } from '../../factories';
import { getCharacter } from '../../utils';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
};

export default class DisableCharacterManaStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const character = await CharacterFactory.getFromPlayerId(
            input.playerId,
            replyInstance.guildId!,
        );

        await CharacterFactory.edit(character.id, { baseMana: null, currentMana: null });
        replyInstance.reply(`Mana desabilitada para o personagem **${character.name}**.`);
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const input = {
            playerId: interaction.options.getUser('player')?.id ?? interaction.user.id,
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const character = await getCharacter(message, messageAsList);
        await this.handleInput({ playerId: `${character.player}` }, message);
    }
}
