import { Message } from 'discord.js';
import { Strategy } from '../strategies';
import { getPermissionName, StrategyDecorator } from './base-decorator';

export default class HasStrategyPermission extends StrategyDecorator {
    constructor(
        strategy: Strategy,
        private readonly permission: bigint,
    ) {
        super(strategy);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const messageAuthor = await message.guild.members.fetch(message.author.id);
        if (!messageAuthor.permissions.has(this.permission)) {
            message.reply(
                `Você não possui a permissão de **${getPermissionName(this.permission)}** necessária para executar este comando.`,
            );
            return;
        }

        this.strategy.execute(message, messageAsList);
    }
}
