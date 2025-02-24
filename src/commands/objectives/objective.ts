import { Message } from 'discord.js';
import { CreateObjectiveStrategy, Strategy } from '../../strategies';
import Command from '../base-command';

export default class Objective implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const subCommand = messageAsList.splice(0, 1)[0];

        let strategy: Strategy;

        switch (subCommand) {
            case 'create': {
                strategy = new CreateObjectiveStrategy();
                break;
            }
            case 'list':
                break;
            case 'info':
                break;
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

        await strategy!.execute(message as Message<true>, messageAsList);

        strategy = null!;
    }
}
