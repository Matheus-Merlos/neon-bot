import { Colors } from 'discord.js';
import { objective } from '../../db/schema';
import ObjectiveDifficultyFactory from '../../factories/objectives/objective-difficulty-factory';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import { ListCommand } from '../base-command';

export default class Objectives extends ListCommand<typeof objective> {
    constructor() {
        super(ObjectiveFactory.getInstance(), 'Objetivos do servidor', Colors.Blurple, async (entry) => {
            const objectiveDifficulty = await ObjectiveDifficultyFactory.getInstance().getFromId(entry.type);

            return [
                {
                    name: `${entry.name} - ${objectiveDifficulty.name}`,
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
