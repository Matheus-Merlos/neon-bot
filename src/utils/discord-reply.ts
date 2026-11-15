import { ChatInputCommandInteraction, Message, TextChannel } from 'discord.js';

const DISCORD_LIMIT = 2000;

export function splitMessage(text: string, max = DISCORD_LIMIT): string[] {
    const chunks: string[] = [];
    let current = '';

    for (const line of text.split('\n')) {
        if (line.length > max) {
            if (current) {
                chunks.push(current);
                current = '';
            }
            for (let i = 0; i < line.length; i += max) chunks.push(line.slice(i, i + max));
            continue;
        }

        const candidate = current ? `${current}\n${line}` : line;
        if (candidate.length > max) {
            chunks.push(current);
            current = line;
        } else {
            current = candidate;
        }
    }

    if (current) chunks.push(current);
    return chunks;
}

export async function replyInChunks(
    replyInstance: Message<true> | ChatInputCommandInteraction,
    text: string,
): Promise<void> {
    const [first, ...rest] = splitMessage(text);

    await replyInstance.reply({
        content: first,
        allowedMentions: { parse: [], repliedUser: false },
    });

    const channel = replyInstance.channel as TextChannel;
    for (const chunk of rest) {
        await channel.send({ content: chunk, allowedMentions: { parse: [] } });
    }
}

export async function withTyping<T>(
    replyInstance: Message<true> | ChatInputCommandInteraction,
    task: Promise<T>,
): Promise<T> {
    const channel = replyInstance.channel as TextChannel;
    await channel.sendTyping().catch(() => {});
    const interval = setInterval(() => channel.sendTyping().catch(() => {}), 8000);
    try {
        return await task;
    } finally {
        clearInterval(interval);
    }
}
