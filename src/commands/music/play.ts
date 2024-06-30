import { Message, GuildMember } from 'discord.js';
import {
    joinVoiceChannel,
    VoiceConnection,
    createAudioPlayer,
    createAudioResource,
    AudioPlayer,
    AudioResource,
    StreamType,
    AudioPlayerStatus,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';
import axios from 'axios';
import dotenv from 'dotenv';

let fila: Array<AudioResource> = [];
let posicaoAtual: number = 0;

const player: AudioPlayer = createAudioPlayer();

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

    const query: string = message.content.split(' ').slice(1).join(' ');

    if (fila.length === 0) {
        const connection: VoiceConnection = joinVoiceChannel({
            channelId: msg_author.voice.channel.id,
            guildId: msg_author.voice.channel.guild.id,
            adapterCreator: message.guild!.voiceAdapterCreator!,
        });

        connection.subscribe(player);

        fila.push(
            createAudioResource(ytdl(await getSong(query, message), { filter: 'audioonly' }), {
                inputType: StreamType.Arbitrary,
            }),
        );

        player.play(fila[0]);

        message.reply('Tocando agora!');

        player.on(AudioPlayerStatus.Idle, () => {
            posicaoAtual++;
            if (posicaoAtual > fila.length - 1) {
                connection.disconnect();
                fila = [];
                return;
            }
            player.play(fila[posicaoAtual]);
        });
    }
}

async function getSong(songQuery: string, message: Message): Promise<string> {
    dotenv.config();

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
            part: 'snippet',
            q: songQuery,
            type: 'video',
            key: process.env.YOUTUBE_API_KEY,
        },
    });

    if (response.data.items.length > 0) {
        const videoId = response.data.items[0].id.videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        return videoUrl;
    }
    message.reply('Não encontrei nenhuma música!');
    throw new Error();
}
