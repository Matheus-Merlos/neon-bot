import { Message, TextChannel } from 'discord.js';
import { default as npcFactory } from '../../factories/npc-factory';
import Strategy from '../base-strategy';

export default class CreateNPCStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        if (messageAsList.length === 1) {
            message.reply(
                'Prefixo inválido, todo NPC deve ter um prefixo.\nUso: `npc create <nome(nao precisa de aspas)> <prefixo>`',
            );
            return;
        }

        const prefix = messageAsList[messageAsList.length - 1];
        const npcName = messageAsList.slice(0, messageAsList.length - 1).join(' ');

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
            prefix,
        });

        await message.reply(`NPC **${createdNpc.name}** criado com sucesso!`);
    }
}
