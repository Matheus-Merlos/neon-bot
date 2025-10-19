import { Message } from 'discord.js';
import { NPC } from '../../db/schema';
import npcFactory from '../../factories/npc-factory';
import client from '../../main';
import addConfirmation from '../../utils/confirmation-row';
import Strategy from '../base-strategy';

export default class DeleteNPCStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const npcName = messageAsList.join(' ');

        let entry: NPC;
        try {
            entry = await npcFactory.getByName(npcName, message.guildId, message.author.id);
        } catch {
            message.reply(`Não existe um npc com o nome **${npcName}**.`);
            return;
        }

        addConfirmation({
            message,
            timeToInteract: 30_000,
            confirmationMsgContent: `Atenção: Isso irá deletar completamente o npc **${entry.name}**, você tem certeza que quer fazer isso?`,
            interactionFilter: (i) => i.user.id === message.author.id,
            actions: {
                callbackFnAccept: async (confirmationMessage: Message) => {
                    const webhook = await client.getClient.fetchWebhook(`${entry.webhookId}`);
                    await webhook.delete();

                    await npcFactory.delete(entry.id);

                    confirmationMessage.edit({
                        content: `Npc **${entry.name}** deletado com sucesso.`,
                        components: [],
                    });
                    return;
                },

                callbackFnDecline: () => {
                    throw new Error();
                },
            },
        });
    }
}
