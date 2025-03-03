import { Colors, EmbedBuilder, Message } from 'discord.js';
import Strategy from '../base-strategy';

export default class DefaultStrategy implements Strategy {
    constructor(
        private readonly commandName: string,
        private readonly infoObj: Array<{ name: string; description: string }>,
    ) {}
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const embed = new EmbedBuilder()
            .setTitle(`Comando \`${this.commandName}\``)
            .setColor(Colors.Blue)
            .setDescription('Sub-comandos: ')
            .setFields(
                this.infoObj.map((entry) => {
                    return {
                        name: `• \`${entry.name}\``,
                        value: entry.description,
                        inline: false,
                    };
                }),
            );
        message.reply({ embeds: [embed] });
    }
}
