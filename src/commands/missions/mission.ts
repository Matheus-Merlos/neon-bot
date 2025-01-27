import { Message } from 'discord.js';
import MissionFactory from '../../factories/missions/mission-factory';
import Command from '../base-command';

export default class Mission implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
        const missionName = messageAsList.join(' ').trim();

        let mission;

        try {
            mission = await MissionFactory.getInstance().getByName(missionName, message.guildId!);
        } catch {
            await message.reply(`Não foi encontrado uma missão com o nome **${missionName}**.`);
            return;
        }

        await message.reply({ embeds: [MissionFactory.getInstance().show(mission)] });
    }
}
