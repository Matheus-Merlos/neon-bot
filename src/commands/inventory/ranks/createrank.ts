import { Message } from 'discord.js';
import { Command } from '../../command';
import { Rank, RankFactory } from './rank';

export default class CreateRank implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray: Array<string> = message.content.split(' ');

        const rankName: string = msgArray[1];
        const rankExp: number = parseInt(msgArray[2]);
        const rankRoleId: bigint = BigInt(this.getRoleIdFromMention(msgArray[3]));

        const rank: Rank = await RankFactory.createRank(rankName, rankExp, rankRoleId);

        await message.reply(`Rank ${rank.name} criado com sucesso!`);
    }

    private getRoleIdFromMention(roleMention: string): string {
        return roleMention.slice(3, roleMention.length - 1);
    }
}
