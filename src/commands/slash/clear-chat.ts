import {
    ChatInputCommandInteraction,
    DiscordAPIError,
    SlashCommandBuilder,
    TextChannel,
} from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('clear-chat')
        .setDescription('Limpar mensagens OOC do chat (mensagens com //, ((, || ou gifs)'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const messages = await interaction.channel!.messages.fetch({ limit: 100 });
        const messagesToDelete = messages.filter(
            (message) =>
                message.content.startsWith('//') ||
                message.content.startsWith('((') ||
                message.content.startsWith('||') ||
                message.content.endsWith('//') ||
                message.content.endsWith('((') ||
                message.content.includes('gif'),
        );

        try {
            await (interaction.channel as TextChannel).bulkDelete(messagesToDelete);
        } catch (e) {
            if (!(e instanceof DiscordAPIError)) {
                throw e;
            }
        }

        await interaction.reply(
            `**${messagesToDelete.size}** mensagens foram deletadas com sucesso.`,
        );
    },
};
