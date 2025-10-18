import { Message } from 'discord.js';
import { default as npcFactory } from '../../factories/npc-factory';
import Strategy from '../base-strategy';

export default class SwitchNPCStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const npcName = messageAsList.join(' ');

        const npc = await npcFactory.getByName(npcName, message.guildId, message.author.id);
        if (!npc || npc === undefined) {
            await message.reply(`Você não possui um NPC com o nome **${npcName}**.`);
            return;
        }

        await npcFactory.edit(npc.id, { isActive: true });

        await message.reply(`Você assumiu **${npc.name}**`);
    }
}
