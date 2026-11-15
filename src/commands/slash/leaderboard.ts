import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import CharacterFactory from '../../factories/character-factory';
import embedList from '../../utils/embed-list';

export default {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Mostrar o ranking de jogadores')
        .addStringOption((option) =>
            option
                .setName('type')
                .setDescription('Tipo de ranking (xp ou gold). Default: xp')
                .addChoices({ name: 'XP', value: 'xp' }, { name: 'Gold', value: 'gold' }),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const option = (interaction.options.getString('type') ?? 'xp') as 'xp' | 'gold';

        const characters = await CharacterFactory.getAll(interaction.guildId!);
        characters.sort((a, b) => b[option] - a[option]);

        await embedList(
            characters,
            10,
            interaction,
            (matrix: Array<typeof characters>, currentIndex: number) => {
                const rankEmbed = new EmbedBuilder()
                    .setTitle(`Ranking de ${option.toUpperCase()}`)
                    .setColor(Colors.Gold)
                    .setFooter({ text: `Página ${currentIndex + 1}/${matrix.length}` });

                matrix[currentIndex].forEach((rank, idx) => {
                    rankEmbed.addFields({
                        name: ' ',
                        value: `**${idx + 1}.${rank.name}**- ${option === 'gold' ? '$' : ''}${rank[option]}`,
                        inline: false,
                    });
                });

                return rankEmbed;
            },
        );
    },
};
