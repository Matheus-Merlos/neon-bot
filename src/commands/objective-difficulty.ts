import { Colors } from 'discord.js';
import ObjectiveDifficultyFactory from '../factories/objectives/objective-difficulty-factory';
import { CreateObjectiveDifficultyStrategy, ListStrategy } from '../strategies';
import DeleteStrategy from '../strategies/generics/delete';
import { StrategyCommand } from './base-command';

export default class ObjectiveDifficulty extends StrategyCommand {
    constructor() {
        super('objective-difficulty', {
            create: new CreateObjectiveDifficultyStrategy(),
            list: new ListStrategy(
                ObjectiveDifficultyFactory.getInstance(),
                'Dificuldade de objetivos',
                Colors.DarkRed,
                (entry) => {
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
                },
            ),
            delete: new DeleteStrategy(ObjectiveDifficultyFactory.getInstance(), 'dificuldade de objetivo'),
        });
    }
}
