import { Message } from 'discord.js';
import { InferSelectModel } from 'drizzle-orm';
import { character } from '../db/schema';
import { CharacterFactory } from '../factories';

function getIdFromMention(mention: string): string {
    return mention.slice(2, mention.length - 1);
}

async function getCharacter(message: Message<true>, messageAsList: Array<string>): Promise<InferSelectModel<typeof character>> {
    let char;
    if (messageAsList[0] && messageAsList[0].includes('@')) {
        char = await CharacterFactory.getInstance().getFromPlayerId(getIdFromMention(messageAsList[0]), message.guildId);
        messageAsList.splice(0, 1);
    } else {
        char = await CharacterFactory.getInstance().getFromPlayerId(message.author.id, message.guildId!);
    }

    return char;
}

export default getCharacter;
