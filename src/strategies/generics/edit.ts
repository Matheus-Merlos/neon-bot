import { Message } from 'discord.js';
import Strategy from '../base-strategy';

export default class EditStrategy implements Strategy {
    constructor(private readonly editCommands: Record<string, Strategy> = {}) {}

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const subCommand = messageAsList.splice(0, 1)[0];

        const strategy: Strategy = this.editCommands[subCommand];
        if (!strategy) {
            message.reply(
                `Essa opção de edição não existe!\nAs opções disponíveis para esse comando são: ${Object.keys(this.editCommands).join(' ')}`,
            );
            return;
        }

        await strategy.execute(message, messageAsList);
    }
}
