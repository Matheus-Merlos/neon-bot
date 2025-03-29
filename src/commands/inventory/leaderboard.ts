import { Colors, EmbedBuilder, Message } from 'discord.js';
import CharacterFactory from '../../factories/character-factory';
import embedList from '../../utils/embed-list';
import Command from '../base-command';

export default class Leaderboard implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const characters = await CharacterFactory.getAll(message.guildId!);

        let option: 'xp' | 'gold' = messageAsList[0] as 'xp' | 'gold';
        if (!option || !['xp', 'gold'].includes(option)) {
            option = 'xp';
        }

        characters.sort((a, b) => b[option] - a[option]);

        await embedList(characters, 10, message, (matrix: Array<typeof characters>, currentIndex: number) => {
            const rankEmbed = new EmbedBuilder()
                .setTitle(`Ranking de ${option.toUpperCase()}`)
                .setColor(Colors.Gold)
                .setFooter({ text: `Página ${currentIndex + 1}/${matrix.length}` });

            matrix[currentIndex].forEach((rank, idx) => {
                rankEmbed.addFields({
                    name: ' ',
                    value: `**${idx + 1}.${rank.name}**- ${option === 'gold' ? '$' : ''}${rank[option]}`,
                    inline: false,
                });
            });

            return rankEmbed;
        });
    }
}
