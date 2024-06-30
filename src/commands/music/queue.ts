import { Message, EmbedBuilder } from 'discord.js';
import { songNames, posicaoAtual } from './play';

export default async function queue(message: Message) {
    const songs = songNames.slice(posicaoAtual);
    const embed = new EmbedBuilder()
        .setColor('Aqua')
        .setTitle('Fila atual:')
        .addFields(
            songs.map((song, index) => {
                return { name: `Musica ${index + 1}:`, value: song };
            }),
        );

    message.reply({ embeds: [embed] });
}
