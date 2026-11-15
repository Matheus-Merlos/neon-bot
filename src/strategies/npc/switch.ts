import { ChatInputCommandInteraction, Message } from 'discord.js';
import { default as npcFactory } from '../../factories/npc-factory';
import { IStrategy } from '../base-strategy';

type Input = {
    npcName: string;
    userId: string;
};

export default class SwitchNPCStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const npc = await npcFactory.getByName(input.npcName, replyInstance.guildId!, input.userId);
        if (!npc || npc === undefined) {
            await replyInstance.reply(`Você não possui um NPC com o nome **${input.npcName}**.`);
            return;
        }

        await npcFactory.edit(npc.id, { isActive: true });

        await replyInstance.reply(`Você assumiu **${npc.name}**`);
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const input = {
            npcName: interaction.options.getString('name', true),
            userId: interaction.user.id,
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        await this.handleInput(
            { npcName: messageAsList.join(' '), userId: message.author.id },
            message,
        );
    }
}
