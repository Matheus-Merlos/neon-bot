import { Colors, Message } from 'discord.js';
import ObjectiveDifficultyFactory from '../../factories/objectives/objective-difficulty-factory';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import {
    CompleteObjectiveStrategy,
    CreateObjectiveStrategy,
    InfoStrategy,
    ListCompletedObjectivesStrategy,
    ListStrategy,
    SelectObjectiveStrategy,
    SelectedObjectivesStrategy,
    Strategy,
} from '../../strategies';
import DeleteStrategy from '../../strategies/generics/delete-strategy';
import Command from '../base-command';

export default class Objective implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const subCommand = messageAsList.splice(0, 1)[0];

        const subCommands: Record<string, Strategy> = {
            create: new CreateObjectiveStrategy(),
            list: new ListStrategy(ObjectiveFactory.getInstance(), 'Objetivos do servidor', Colors.Blurple, async (entry) => {
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
            }),
            info: new InfoStrategy(ObjectiveFactory.getInstance()),
            delete: new DeleteStrategy(ObjectiveFactory.getInstance(), 'objetivo'),
            select: new SelectObjectiveStrategy(),
            selected: new SelectedObjectivesStrategy(),
            completed: new CompleteObjectiveStrategy(),
            'list-completed': new ListCompletedObjectivesStrategy(),
        };

        const strategy: Strategy = subCommands[subCommand];

        await strategy.execute(message as Message<true>, messageAsList);
    }
}
