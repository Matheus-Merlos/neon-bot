import { ChatInputCommandInteraction, Colors, EmbedBuilder, Message } from 'discord.js';
import npcFactory from '../../factories/npc-factory';
import embedList from '../../utils/embed-list';
import { IStrategy } from '../base-strategy';

type Input = {
    userId: string;
    username: string;
};

export default class ListNPCStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const entries = await npcFactory.getAll(replyInstance.guildId!, input.userId);

        if (entries.length === 0) {
            await replyInstance.reply('Nenhum registro encontrado em seu usuário.');
            return;
        }

        await embedList(
            entries,
            10,
            replyInstance,
            async (matrix: Array<typeof entries>, currentIndex: number) => {
                const embed = new EmbedBuilder()
                    .setTitle(`NPCs de ${input.username}`)
                    .setColor(Colors.LuminousVividPink)
                    .setFooter({ text: `Página ${currentIndex + 1}/${matrix.length}` });

                const items = matrix[currentIndex];

                for (const entry of items) {
                    embed.addFields({
                        name: `${entry.name}`,
                        value: `Prefixo: ${entry.prefix}`,
                        inline: false,
                    });
                }

                return embed;
            },
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const input = {
            userId: interaction.user.id,
            username: interaction.user.username,
        };

        await this.handleInput(input, interaction);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(message: Message<true>, _messageAsList: Array<string>): Promise<void> {
        const input = {
            userId: message.author.id,
            username:
                message.author.username ?? message.author.displayName ?? message.author.globalName!,
        };

        await this.handleInput(input, message);
    }
}
