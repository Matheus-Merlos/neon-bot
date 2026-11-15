import { ChatInputCommandInteraction, Message } from 'discord.js';
import { CharacterFactory } from '../../factories';
import getIdFromMention from '../../utils/get-id-from-mention';
import { IStrategy } from '../base-strategy';

type Input = {
    senderId: string;
    receiverId: string;
    quantity: number;
};

export default class PayStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const sender = await CharacterFactory.getFromPlayerId(
            input.senderId,
            replyInstance.guildId!,
        );
        const receiver = await CharacterFactory.getFromPlayerId(
            input.receiverId,
            replyInstance.guildId!,
        );

        if (sender.gold < input.quantity) {
            await replyInstance.reply(
                'Você não possui dinheiro o suficiente para realizar essa transação.',
            );
            return;
        }

        await CharacterFactory.edit(sender.id, { gold: sender.gold - input.quantity });
        await CharacterFactory.edit(receiver.id, { gold: receiver.gold + input.quantity });

        await replyInstance.reply(
            `Você depositou **${input.quantity}** para <@${receiver.player}>.`,
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            senderId: interaction.user.id,
            receiverId: o.getUser('player', true).id,
            quantity: o.getNumber('quantity', true),
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const input = {
            senderId: message.author.id,
            receiverId: getIdFromMention(messageAsList[0]),
            quantity: parseInt(messageAsList[1]),
        };

        await this.handleInput(input, message);
    }
}
