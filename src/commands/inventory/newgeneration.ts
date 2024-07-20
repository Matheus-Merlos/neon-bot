import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Message,
    PermissionFlagsBits,
} from 'discord.js';
import { Command } from '../command';
import { hasPermission } from '../decorators';
import { Character, CharacterFactory } from './character';

export default class NewGeneration implements Command {
    @hasPermission(PermissionFlagsBits.Administrator)
    public async execute(message: Message): Promise<void> {
        const confirmationButton: ButtonBuilder = new ButtonBuilder()
            .setCustomId('confirmation-button')
            .setLabel('Confirmar')
            .setStyle(ButtonStyle.Danger);

        const declineButton: ButtonBuilder = new ButtonBuilder()
            .setCustomId('decline-button')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Primary);

        const buttonRow: ActionRowBuilder<ButtonBuilder> =
            new ActionRowBuilder<ButtonBuilder>().addComponents(confirmationButton, declineButton);

        const confirmationMsg = await message.reply({
            content:
                'Atenção, isso irá desativar **TODOS** os personagens de todos os jogadores, você tem certeza que quer fazer isso?',
            components: [buttonRow],
        });

        const confirmation = await confirmationMsg.awaitMessageComponent({
            filter: (i) => i.user.id === message.author.id,
            time: 60_000,
        });

        switch (confirmation.customId) {
            case 'confirmation-button': {
                const characters: Array<Character> = await CharacterFactory.retireveAllCharacters();
                characters.forEach(async (character: Character) => {
                    await character.inactivateCharacter();
                });
                message.reply('Todos os personagems foram inativados com sucesso.');
                return;
            }
            case 'decline-button': {
                message.delete();
                confirmationMsg.delete();
                return;
            }
        }
        return;
    }
}
