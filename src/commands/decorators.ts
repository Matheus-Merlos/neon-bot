import { Message, PermissionsBitField } from 'discord.js';
import Command from './command';

function hasPermission(
    target: Command,
    methodName: string,
    descriptor: PropertyDescriptor,
): PropertyDescriptor {
    const originalMethod = descriptor.value;
    return {
        value: async function (...args: Array<unknown>) {
            const message: Message = (this as Command).message;
            if (message.member!.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return await originalMethod.apply(this, ...args);
            }
            message.reply('Você não tem permissão para isso!');
            return;
        },
    };
}

export { hasPermission };
