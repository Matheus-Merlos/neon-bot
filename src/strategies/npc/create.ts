import { Message, TextChannel } from 'discord.js';
import { default as npcFactory } from '../../factories/npc-factory';
import Strategy from '../base-strategy';

export default class CreateNPCStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const npcName = messageAsList.join(' ');

        const img = message.attachments.first();
        const isValidImage = img && img.contentType && img.contentType.includes('image');

        const webhook = await (message.channel as TextChannel).createWebhook({
            name: npcName,
            avatar: isValidImage ? img!.url : '',
        });

        const createdNpc = await npcFactory.create({
            name: npcName,
            guildId: BigInt(message.guildId!),
            playerDiscordId: BigInt(message.author.id),
            webhookId: BigInt(webhook.id),
            webhookToken: webhook.token,
        });

        await message.reply(`NPC **${createdNpc.name}** criado com sucesso!`);
    }
}
