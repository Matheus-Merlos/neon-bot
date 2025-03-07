import { Colors } from 'discord.js';
import { missionDifficulty } from '../db/schema';
import MissionDifficultyFactory from '../factories/missions/mission-difficulty-factory';
import { SimpleTableCommand } from './base-command';

export default class MissionDifficulty extends SimpleTableCommand<typeof missionDifficulty, MissionDifficultyFactory> {
    constructor() {
        super('mission-difficulty', MissionDifficultyFactory.getInstance(), Colors.White, 'dificuldade de missão');
    }
}
