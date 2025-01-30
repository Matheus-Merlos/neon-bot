import { Colors } from 'discord.js';
import { mission } from '../../db/schema';
import MissionDifficultyFactory from '../../factories/missions/mission-difficulty-factory';
import MissionFactory from '../../factories/missions/mission-factory';
import { ListCommand } from '../base-command';

export default class Missions extends ListCommand<typeof mission, MissionFactory> {
    constructor() {
        super(MissionFactory.getInstance(), 'Missões disponíveis do servidor', Colors.DarkRed, async (entry) => {
            const missionDifficulty = await MissionDifficultyFactory.getInstance().getFromId(entry.difficulty);

            return [
                {
                    name: `${entry.name.toUpperCase()} - ${missionDifficulty.name}`,
                    value: `XP: ${entry.xp} | Dinheiro: $${entry.gold}`,
                    inline: false,
                },
                {
                    name: ' ',
                    value: ' ',
                    inline: false,
                },
            ];
        });
    }
}
