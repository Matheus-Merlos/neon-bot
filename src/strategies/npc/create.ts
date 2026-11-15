import { Attachment, ChatInputCommandInteraction, Message, TextChannel } from 'discord.js';
import { default as npcFactory } from '../../factories/npc-factory';
import { IStrategy } from '../base-strategy';

type Input = {
    name: string;
    prefix: string;
    image: Attachment | null;
    userId: string;
};

export default class CreateNPCStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const isValidImage =
            input.image && input.image.contentType && input.image.contentType.includes('image');

        const channel = replyInstance.channel as TextChannel;
        const webhook = await channel.createWebhook({
            name: input.name,
            avatar: isValidImage ? input.image!.url : '',
        });

        const createdNpc = await npcFactory.create({
            name: input.name,
            guildId: BigInt(replyInstance.guildId!),
            playerDiscordId: BigInt(input.userId),
            webhookId: BigInt(webhook.id),
            webhookToken: webhook.token,
            prefix: input.prefix,
        });

        await replyInstance.reply(`NPC **${createdNpc.name}** criado com sucesso!`);
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            name: o.getString('name', true),
            prefix: o.getString('prefix', true),
            image: o.getAttachment('image') ?? null,
            userId: interaction.user.id,
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        if (messageAsList.length === 1) {
            message.reply(
                'Prefixo inválido, todo NPC deve ter um prefixo.\nUso: `npc create <nome(nao precisa de aspas)> <prefixo>`',
            );
            return;
        }

        const prefix = messageAsList[messageAsList.length - 1];
        const name = messageAsList.slice(0, messageAsList.length - 1).join(' ');
        const img = message.attachments.first();

        await this.handleInput(
            { name, prefix, image: img ?? null, userId: message.author.id },
            message,
        );
    }
}
