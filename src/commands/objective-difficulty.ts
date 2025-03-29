import { Colors } from 'discord.js';
import { objectiveDifficulty } from '../db/schema';
import ObjectiveDifficultyFactory from '../factories/objectives/objective-difficulty-factory';
import { SimpleTableCommand } from './base-command';

export default class ObjectiveDifficulty extends SimpleTableCommand<
    typeof objectiveDifficulty,
    typeof ObjectiveDifficultyFactory
> {
    constructor() {
        super('objective-difficulty', ObjectiveDifficultyFactory, Colors.DarkRed, 'dificuldade de objetivo');
    }
}
