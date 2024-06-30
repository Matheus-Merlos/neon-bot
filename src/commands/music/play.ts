import { Message, GuildMember, EmbedBuilder } from 'discord.js';
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

let queue: Array<AudioResource> = [];
const songNames: Array<string> = [];
let posicaoAtual: number = 0;

const player: AudioPlayer = createAudioPlayer();
let connection: VoiceConnection | null;

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

    const songUrl = await getSongUrl(query, message);
    const song: AudioResource = createAudioResource(
        ytdl(songUrl, {
            filter: 'audioonly',
            highWaterMark: 1 << 62,
            liveBuffer: 1 << 62,
            dlChunkSize: 0,
            quality: 'lowestaudio',
        }),
        {
            inputType: StreamType.Arbitrary,
        },
    );
    queue.push(song);

    const songInfo = await getSongInfo(songUrl);

    songNames.push(songInfo.videoTitle);

    if (queue.length === 1) {
        connection = joinVoiceChannel({
            channelId: msg_author.voice.channel.id,
            guildId: msg_author.voice.channel.guild.id,
            adapterCreator: message.guild!.voiceAdapterCreator!,
        });

        connection.subscribe(player);

        player.play(queue[0]);

        player.on(AudioPlayerStatus.Idle, () => {
            posicaoAtual++;
            if (posicaoAtual > queue.length - 1) {
                player.stop();
                resetConnection();
                return;
            }
            player.play(queue[posicaoAtual]);
        });

        message.reply(`**Tocando** :notes: __**${songInfo.videoTitle}**__ - Agora!`);
    } else {
        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: 'Adicionado a fila:' })
            .setTitle(songInfo.videoTitle)
            .addFields(
                { name: 'Canal', value: songInfo.channelName, inline: true },
                { name: 'Duração', value: songInfo.videoDuration, inline: true },
                { name: 'Posição em fila', value: queue.length.toString(), inline: true },
            )
            .setThumbnail(songInfo.thumbnailUrl);

        message.reply({ embeds: [embed] });
    }
}

async function getSongUrl(songQuery: string, message: Message): Promise<string> {
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
        const videoId: string = response.data.items[0].id.videoId;
        const videoUrl: string = `https://www.youtube.com/watch?v=${videoId}`;

        return videoUrl;
    }
    message.reply('Não encontrei nenhuma música!');
    throw new Error();
}

async function getSongInfo(songUrl: string): Promise<{
    channelName: string;
    videoTitle: string;
    videoDuration: string;
    thumbnailUrl: string;
}> {
    const songId = songUrl.replace('https://www.youtube.com/watch?v=', '');

    dotenv.config();

    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
            part: 'snippet,contentDetails',
            id: songId,
            type: 'video',
            key: process.env.YOUTUBE_API_KEY,
        },
    });

    const video = response.data.items[0];
    const channelName: string = video.snippet.channelTitle;
    const videoTitle: string = video.snippet.title;
    const videoDuration: string = video.contentDetails.duration
        .replace('PT', '')
        .replace('M', ':')
        .replace('S', '');
    const thumbnailUrl: string = video.snippet.thumbnails.default.url;

    return {
        channelName,
        videoTitle,
        videoDuration,
        thumbnailUrl,
    };
}

function increasePosition(): void {
    posicaoAtual++;
}

function resetConnection(): void {
    queue = [];
    posicaoAtual = 0;
    if (connection) {
        connection.disconnect();
        connection = null;
    }
}

export { queue, increasePosition, player, posicaoAtual, songNames, resetConnection };
