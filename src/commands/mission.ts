import { Colors } from 'discord.js';
import MissionDifficultyFactory from '../factories/missions/mission-difficulty-factory';
import MissionFactory from '../factories/missions/mission-factory';
import { CompletedMissionStrategy, CreateMissionStrategy, DeleteStrategy, InfoStrategy, ListStrategy } from '../strategies';
import { StrategyCommand } from './base-command';

export default class Mission extends StrategyCommand {
    constructor() {
        super('mission', {
            create: new CreateMissionStrategy(),
            info: new InfoStrategy(MissionFactory.getInstance()),
            list: new ListStrategy(MissionFactory.getInstance(), 'missões', Colors.Fuchsia, async (entry) => {
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
            }),
            delete: new DeleteStrategy(MissionFactory.getInstance(), 'missão'),
            complete: new CompletedMissionStrategy(),
        });
    }
}
