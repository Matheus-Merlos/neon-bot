import { Message, PermissionResolvable, PermissionsBitField } from 'discord.js';
import Command from '../commands/base-command';

function getPermissionName(permission: PermissionResolvable): string {
    for (const [perm, permValue] of Object.entries(PermissionsBitField.Flags)) {
        if (permValue === permission) {
            return perm;
        }
    }
    return 'UnknownPermission';
}

export default function hasPermission(...permissions: Array<PermissionResolvable>) {
    return function (classPrototype: Command, methodName: string, descriptor: PropertyDescriptor) {
        const callable = descriptor.value;
        async function wrapper(message: Message, messageAsList: Array<string>) {
            for (const permission of permissions) {
                const member = await message.guild!.members.fetch(message.author.id);
                if (member.permissions.has(permission)) {
                    await callable(message, messageAsList);
                    return;
                } else {
                    await message.reply(
                        `Você não possui a permissão de **${getPermissionName(permission)}** necessária para executar este comando`,
                    );
                }
            }
        }
        return {
            value: wrapper,
        };
    };
}
