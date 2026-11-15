import { ChatInputCommandInteraction, Message } from 'discord.js';
import { NPC } from '../../db/schema';
import npcFactory from '../../factories/npc-factory';
import client from '../../main';
import addConfirmation from '../../utils/confirmation-row';
import { IStrategy } from '../base-strategy';

type Input = {
    npcName: string;
};

export default class DeleteNPCStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const userId = 'author' in replyInstance ? replyInstance.author.id : replyInstance.user.id;

        let entry: NPC;
        try {
            entry = await npcFactory.getByName(input.npcName, replyInstance.guildId!, userId);
        } catch {
            replyInstance.reply(`Não existe um npc com o nome **${input.npcName}**.`);
            return;
        }

        addConfirmation({
            replyInstance,
            timeToInteract: 30_000,
            confirmationMsgContent: `Atenção: Isso irá deletar completamente o npc **${entry.name}**, você tem certeza que quer fazer isso?`,
            interactionFilter: (i) => i.user.id === userId,
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

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const input = {
            npcName: interaction.options.getString('name', true),
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const npcName = messageAsList.join(' ');
        await this.handleInput({ npcName }, message);
    }
}
