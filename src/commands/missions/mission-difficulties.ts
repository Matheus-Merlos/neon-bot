import { Colors, EmbedBuilder, Message } from 'discord.js';
import MissionDifficultyFactory from '../../factories/missions/mission-difficulty-factory';
import embedList from '../../utils/embed-list';
import Command from '../base-command';

export default class MissionDifficulties implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const missionDifficulties = await MissionDifficultyFactory.getInstance().getAll(message.guildId!);

        await embedList(missionDifficulties, 5, message, (matrix: Array<typeof missionDifficulties>, currentIndex: number) => {
            const embed = new EmbedBuilder()
                .setTitle(`Dificuldades de Missão de ${message.guild!.name}`)
                .setColor(Colors.Blurple)
                .setFooter({ text: `Página ${currentIndex + 1}/${matrix.length}` });

            const missionDifficulties = matrix[currentIndex];

            missionDifficulties.forEach((cls) => {
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
