import { Message, GuildMember, EmbedBuilder, TextChannel } from 'discord.js';
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

let queue: Array<AudioResource> = [];
let songNames: Array<string> = [];
let posicaoAtual: number = 0;

const player: AudioPlayer = createAudioPlayer();
let connection: VoiceConnection | null;

let currentTextChannel: TextChannel;

player.on(AudioPlayerStatus.Idle, () => {
    posicaoAtual++;
    if (posicaoAtual > queue.length - 1) {
        player.stop();
        resetConnection();

        currentTextChannel.send('A fila acabou, desconectando');

        return;
    }
    player.play(queue[posicaoAtual]);
    currentTextChannel.send(`**Tocando** :notes: __**${songNames[posicaoAtual]}**__ - Agora!`);
});

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

    if (!(message.channel instanceof TextChannel)) {
        message.reply('Não é possível atribuir currentTextChannel: não é um TextChannel.');
        return;
    }

    const msgArray = message.content.split(' ');
    if (msgArray.length <= 1) {
        message.reply('Não foi informado uma busca!');
        return;
    }
    const query: string = msgArray.slice(1).join(' ');

    currentTextChannel = message.channel;

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

        message.reply(`**Tocando** :notes: __**${songInfo.videoTitle}**__ - Agora!`);
        return;
    }
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

async function getSongUrl(songQuery: string, message: Message): Promise<string> {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
            part: 'snippet',
            q: songQuery,
            type: 'video',
            key: process.env.YOUTUBE_API_KEY,
        },
    });

    if (!(response.data.items.length > 0)) {
        message.reply('Não encontrei nenhuma música!');
        throw new Error();
    }
    const videoId: string = response.data.items[0].id.videoId;
    const videoUrl: string = `https://www.youtube.com/watch?v=${videoId}`;

    return videoUrl;
}

async function getSongInfo(songUrl: string): Promise<{
    channelName: string;
    videoTitle: string;
    videoDuration: string;
    thumbnailUrl: string;
}> {
    const songId = songUrl.replace('https://www.youtube.com/watch?v=', '');

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
    songNames = [];
    posicaoAtual = 0;
    if (connection) {
        connection.disconnect();
        connection = null;
    }
}

function removeFromQueue(index: number): void {
    queue.splice(index, 1);
    songNames.splice(index, 1);
}

export {
    queue,
    increasePosition,
    player,
    posicaoAtual,
    songNames,
    resetConnection,
    removeFromQueue,
};
