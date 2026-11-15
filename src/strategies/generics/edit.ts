import { ChatInputCommandInteraction, Message } from 'discord.js';
import Strategy from '../base-strategy';

type StrategyWithSlash = Strategy & {
    executeSlashCommand?: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export default class EditStrategy implements Strategy {
    constructor(private readonly editCommands: Record<string, StrategyWithSlash> = {}) {}

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const subCommand = interaction.options.getSubcommand();

        const strategy = this.editCommands[subCommand];
        if (!strategy || !strategy.executeSlashCommand) {
            interaction.reply(
                `Essa opção de edição não existe!\nAs opções disponíveis para esse comando são: ${Object.keys(this.editCommands).join(' ')}`,
            );
            return;
        }

        await strategy.executeSlashCommand(interaction);
    }

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
