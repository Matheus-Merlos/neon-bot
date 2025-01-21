import { Colors, EmbedBuilder, Message } from 'discord.js';
import ClassFactory from '../../factories/class-objectives/class-factory';
import embedList from '../../utils/embed-list';
import Command from '../base-command';

export default class Classes implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const classes = await ClassFactory.getInstance().getAll();

        await embedList(classes, 5, message, (matrix: Array<typeof classes>, currentIndex: number) => {
            const embed = new EmbedBuilder()
                .setTitle(`Classes de ${message.guild!.name}`)
                .setColor(Colors.Blurple)
                .setFooter({ text: `Página ${currentIndex + 1}/${matrix.length}` });

            const classes = matrix[currentIndex];

            classes.forEach((cls) => {
                embed.addFields({
                    name: `${cls.name}`,
                    value: ' ',
                    inline: false,
                });
            });

            return embed;
        });
    }
}
