import { Message } from 'discord.js';
import { Command } from '../../command';
import { Rank, RankFactory } from './rank';

export default class CreateRank implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray: Array<string> = message.content.split(' ');

        const rankName: string = msgArray[1];
        const rankExp: number = parseInt(msgArray[2]);
        const rankRoleIdStr: string = this.getRoleIdFromMention(msgArray[3]);

        if (isNaN(rankExp)) {
            await message.reply(
                'A segunda opção deve ser um número, representando o xp necessário para chegar no rank especificado',
            );
            return;
        }
        if (rankRoleIdStr.length !== 18) {
            await message.reply('O cargo especificado para o rank é inválido');
            return;
        }

        const rank: Rank = await RankFactory.createRank(rankName, rankExp, BigInt(rankRoleIdStr));

        await message.reply(`Rank ${rank.name} criado com sucesso!`);
    }

    private getRoleIdFromMention(roleMention: string): string {
        return roleMention.slice(3, roleMention.length - 1);
    }
}
