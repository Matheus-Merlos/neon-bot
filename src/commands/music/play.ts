import { Message, GuildMember } from 'discord.js';
import {
    joinVoiceChannel,
    VoiceConnection,
    createAudioPlayer,
    createAudioResource,
    AudioPlayer,
    AudioResource,
    entersState,
    VoiceConnectionStatus,
    StreamType,
    AudioPlayerStatus,
} from '@discordjs/voice';

export default async function play(message: Message): Promise<void> {
    const msg_author: GuildMember | null = message.member;
    if (!msg_author) {
        message.reply('Você não está em um canal de voz!');
        return;
    }

    const voiceChannel = msg_author.voice.channel;
    if (!voiceChannel) {
        message.reply('Você não está em um canal de voz!');
        return;
    }

    if (!voiceChannel.joinable) {
        message.reply('Não tenho permissão para entrar neste canal!');
        return;
    }

    const connection: VoiceConnection = joinVoiceChannel({
        channelId: msg_author.voice.channel.id,
        guildId: msg_author.voice.channel.guild.id,
        adapterCreator: message.guild!.voiceAdapterCreator!,
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    } catch (error) {
        connection.destroy();
        throw error;
    }

    const player: AudioPlayer = createAudioPlayer();

    connection.subscribe(player);

    const resource: AudioResource = createAudioResource(
        '/home/matheus/projetos/neon-bot/src/commands/music/teste.mp3',
        {
            inputType: StreamType.Arbitrary,
        },
    );

    player.play(resource);

    entersState(player, AudioPlayerStatus.Playing, 5000);

    message.reply('Tocando agora!');
}
