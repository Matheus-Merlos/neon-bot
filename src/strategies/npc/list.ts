import { Colors, EmbedBuilder, Message } from 'discord.js';
import npcFactory from '../../factories/npc-factory';
import embedList from '../../utils/embed-list';
import Strategy from '../base-strategy';

export default class ListNPCStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const entries = await npcFactory.getAll(message.guildId, message.author.id);

        if (entries.length === 0) {
            await message.reply('Nenhum registro encontrado em seu usuário.');
            return;
        }

        await embedList(
            entries,
            10,
            message,
            async (matrix: Array<typeof entries>, currentIndex: number) => {
                const embed = new EmbedBuilder()
                    .setTitle(
                        `NPCs de ${message.author.username ?? message.author.displayName ?? message.author.globalName}`,
                    )
                    .setColor(Colors.LuminousVividPink)
                    .setFooter({ text: `Página ${currentIndex + 1}/${matrix.length}` });

                const entries = matrix[currentIndex];

                for (const entry of entries) {
                    const fields = [
                        {
                            name: `${entry.name}`,
                            value: ``,
                            inline: false,
                        },
                    ];
                    const fieldsArray = Array.isArray(fields) ? fields : [fields];
                    embed.addFields(...fieldsArray);
                }

                return embed;
            },
        );
    }
}
