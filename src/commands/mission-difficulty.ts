import { Colors } from 'discord.js';
import MissionDifficultyFactory from '../factories/missions/mission-difficulty-factory';
import { CreateStrategy, ListStrategy } from '../strategies';
import DeleteStrategy from '../strategies/generics/delete';
import { StrategyCommand } from './base-command';

export default class MissionDifficulty extends StrategyCommand {
    constructor() {
        super('mission-difficulty', {
            create: new CreateStrategy(MissionDifficultyFactory.getInstance(), 'dificuldade de missão'),
            list: new ListStrategy(MissionDifficultyFactory.getInstance(), 'dificuldades de missão', Colors.White, (entry) => {
                return [
                    {
                        name: `${entry.name}`,
                        value: ' ',
                        inline: false,
                    },
                    {
                        name: ' ',
                        value: ' ',
                        inline: false,
                    },
                ];
            }),
            delete: new DeleteStrategy(MissionDifficultyFactory.getInstance(), 'dificuldade de missão'),
        });
    }
}
