import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildMember,
    PermissionsBitField,
} from 'discord.js';
import Command from '../command';
import { getIdFromMention } from '../../utils';
import { hasPermission } from '../decorators';

export default class Ban extends Command {
    @hasPermission(PermissionsBitField.Flags.BanMembers)
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');
        if (msgArray.length !== 2) {
            this.message.reply('Sintaxe do comando errada!');
            return;
        }
        if (!msgArray[1].includes('@')) {
            this.message.reply('Sintaxe do comando errada!');
            return;
        }

        const memberToBan: GuildMember = await this.message.guild!.members.fetch(
            getIdFromMention(msgArray[1]),
        );

        const confirmationButton = new ButtonBuilder()
            .setCustomId('confirmation')
            .setStyle(ButtonStyle.Danger)
            .setLabel('Banir');

        const declineButton = new ButtonBuilder()
            .setCustomId('decline')
            .setStyle(ButtonStyle.Primary)
            .setLabel('Cancelar');

        const row: ActionRowBuilder<ButtonBuilder> =
            new ActionRowBuilder<ButtonBuilder>().addComponents(confirmationButton, declineButton);

        const confirmationMsg = await this.message.reply({
            content: `:bangbang: Atenção! Você está prestes a banir ${msgArray[1]}, tem certeza disso?`,
            components: [row],
        });

        try {
            const confirmation = await confirmationMsg.awaitMessageComponent({
                filter: (i) => i.user.id === this.message.author.id,
                time: 60_000,
            });

            if (confirmation.customId === 'confirmation') {
                await memberToBan.ban();
                await confirmation.update({
                    content: `**${memberToBan.displayName}** foi banido com sucesso!`,
                    components: [],
                });
                return;
            }
            if (confirmation.customId === 'decline') {
                await confirmationMsg.delete();
                await this.message.delete();
                await this.message.channel.send('Foi tudo um sonho!');
            }
        } catch (e) {
            await confirmationMsg.delete();
            await this.message.delete();
            await this.message.channel.send('Foi tudo um sonho!');
        }
    }
}
