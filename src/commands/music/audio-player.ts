import { Message, GuildMember, EmbedBuilder, TextChannel } from 'discord.js';
import {
    joinVoiceChannel,
    VoiceConnection,
    createAudioPlayer,
    createAudioResource,
    AudioPlayer as Player,
    AudioResource,
    StreamType,
    AudioPlayerStatus,
} from '@discordjs/voice';
import axios from 'axios';
import { Command } from '../command';
import ytdl from 'ytdl-core';

export abstract class AudioPlayerCommand implements Command {
    protected readonly player: AudioPlayer;
    constructor(player: AudioPlayer) {
        this.player = player;
    }

    public abstract execute(message: Message): Promise<void>;
}

export default class AudioPlayer {
    private queue: Array<AudioResource>;
    private songNames: Array<string>;
    private currentPosition: number;

    private player: Player;

    private currentTextChannel: TextChannel | null;

    private connection: VoiceConnection | null;

    constructor() {
        this.queue = [];
        this.songNames = [];
        this.player = createAudioPlayer();

        this.currentPosition = 0;

        this.currentTextChannel = null;

        this.connection = null;

        this.player.on(AudioPlayerStatus.Idle, () => {
            this.currentPosition++;
            if (this.currentPosition > this.queue.length - 1) {
                this.player.stop();
                this.resetConnection();

                this.currentTextChannel!.send('A fila acabou, desconectando');

                return;
            }
            this.player.play(this.queue[this.currentPosition]);
            this.currentTextChannel!.send(
                `**Tocando** :notes: __**${this.songNames[this.currentPosition]}**__ - Agora!`,
            );
        });
    }

    private async getSongUrl(songQuery: string, message: Message): Promise<string> {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: songQuery,
                type: 'video',
                key: process.env.YOUTUBE_API_KEY,
                maxresult: 5,
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
    private async getSongInfo(songUrl: string): Promise<{
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
                maxresult: 5,
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

    private resetConnection(): void {
        this.queue = [];
        this.songNames = [];
        this.currentPosition = 0;
        if (this.connection) {
            this.connection.disconnect();
            this.connection = null;
        }
    }
    private removeFromQueue(index: number): void {
        this.queue.splice(index, 1);
        this.songNames.splice(index, 1);
    }

    public async play(message: Message): Promise<void> {
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
        this.currentTextChannel = message.channel;

        const songUrl = await this.getSongUrl(query, message);

        const audioStream = ytdl(songUrl, {
            filter: 'audioonly',
            highWaterMark: 1 << 62,
            liveBuffer: 1 << 62,
            dlChunkSize: 0,
            quality: 'lowestaudio',
        });

        audioStream.on('error', (error) => {
            console.log(error);
        });
        const song: AudioResource = createAudioResource(audioStream, {
            inputType: StreamType.Arbitrary,
        });

        this.queue.push(song);

        const songInfo = await this.getSongInfo(songUrl);

        this.songNames.push(songInfo.videoTitle);

        if (this.queue.length === 1) {
            this.connection = joinVoiceChannel({
                channelId: msg_author.voice.channel.id,
                guildId: msg_author.voice.channel.guild.id,
                adapterCreator: message.guild!.voiceAdapterCreator!,
            });
            this.connection.subscribe(this.player);

            this.player.play(this.queue[0]);

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
                { name: 'Posição em fila', value: this.queue.length.toString(), inline: true },
            )
            .setThumbnail(songInfo.thumbnailUrl);

        message.reply({ embeds: [embed] });
    }

    public disconnect(message: Message): void {
        this.player.stop();
        this.resetConnection();

        message.reply('Desconectado');
    }

    public songQueue(message: Message) {
        const songs = this.songNames.slice(this.currentPosition);
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

    public async remove(message: Message) {
        const msgString: Array<string> = message.content.split(' ');

        let position: number;
        position = parseInt(msgString[1]);
        if (isNaN(position)) {
            message.reply('Não foi informado uma posição válida');
            return;
        }

        if (position === 1) {
            message.reply(
                'Essa posição é a música que está tocando atualmente, opte por usar o comando `;skip`',
            );
            return;
        }

        const songs = this.songNames.slice(this.currentPosition);
        if (position > songs.length) {
            message.reply('Essa posição é inválida');
            return;
        }

        position--;

        const realPosition: number = position + this.currentPosition;

        message.reply(`**Removido** :notes: __**${this.songNames[realPosition]}**__ da fila`);

        this.removeFromQueue(realPosition);
    }

    public skip(message: Message): void {
        if (message.member!.voice.channel === null) {
            message.reply('Você não está em um canal de voz!');
        }

        if (this.currentPosition + 1 > this.queue.length - 1) {
            message.reply('Não há mais músicas na fila!');
            return;
        }

        this.currentPosition++;
        this.player.stop();
        this.player.play(this.queue[this.currentPosition]);

        message.reply('Skippei a música');
    }
}
