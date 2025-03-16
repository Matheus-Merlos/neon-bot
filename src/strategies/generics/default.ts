import { Colors, EmbedBuilder, Message } from 'discord.js';
import Strategy from '../base-strategy';

export default class DefaultStrategy implements Strategy {
    constructor(
        private readonly commandName: string,
        private readonly infoObj: Record<string, string>,
    ) {}
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const embed = new EmbedBuilder()
            .setTitle(`Comando \`${this.commandName}\``)
            .setColor(Colors.Blue)
            .setDescription('Sub-comandos: ')
            .setFields(
                Object.entries(this.infoObj).map((entry) => {
                    return {
                        name: `• \`${entry[0]}\``,
                        value: entry[1],
                        inline: false,
                    };
                }),
            );
        message.reply({ embeds: [embed] });
    }
}
