import { Colors, EmbedBuilder, Message } from 'discord.js';
import characterFactory from '../../db/factories/character-factory';
import Command from '../base-command';

export default class Inventory implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const char = await characterFactory.getFromPlayerId(message.author.id, message.guildId!);

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`Inventário de ${char.name}`)
            .addFields(
                { name: 'EXP', value: `${char.xp}`, inline: true },
                {
                    name: 'Gold',
                    value: `${char.gold}`,
                    inline: true,
                },
                { name: ' ', value: ' ' },
            );

        if (char.imageUrl) {
            embed.setThumbnail(char.imageUrl);
        }

        await message.reply({ embeds: [embed] });
    }
}
