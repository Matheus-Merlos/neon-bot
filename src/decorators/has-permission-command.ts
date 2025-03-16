import { Message } from 'discord.js';
import { Command } from '../commands';
import { CommandDecorator, getPermissionName } from './base-decorator';

export default class HasCommandPermission extends CommandDecorator {
    constructor(
        command: Command,
        private readonly permission: bigint,
    ) {
        super(command);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const messageAuthor = await message.guild.members.fetch(message.author.id);
        if (!messageAuthor.permissions.has(this.permission)) {
            message.reply(
                `Você não possui a permissão de **${getPermissionName(this.permission)}** necessária para executar este comando.`,
            );
            return;
        }

        this.command.execute(message, messageAsList);
    }
}
