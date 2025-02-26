import { Colors, Message } from 'discord.js';
import ObjectiveDifficultyFactory from '../../factories/objectives/objective-difficulty-factory';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import { CreateObjectiveStrategy, ListStrategy, Strategy } from '../../strategies';
import InfoStrategy from '../../strategies/generics/info-strategy';
import Command from '../base-command';

export default class Objective implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const subCommand = messageAsList.splice(0, 1)[0];

        let strategy: Strategy;

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
        };

        switch (subCommand) {
            case 'delete':
                break;
            case 'choose':
                break;
            case 'select':
                break;
            case 'completed':
                break;
            default:
                break;
        }

        await subCommands[subCommand].execute(message as Message<true>, messageAsList);
    }
}
