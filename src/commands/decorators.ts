import { Message } from 'discord.js';
import { Command } from './command';

function hasPermission(permission: bigint) {
    return function (
        target: Command,
        methodName: string,
        descriptor: PropertyDescriptor,
    ): PropertyDescriptor {
        const originalMethod = descriptor.value;
        return {
            value: async function (...args: Array<unknown>) {
                const message = args[0];
                if (!(message instanceof Message)) {
                    throw new Error();
                }
                if (message.member!.permissions.has(permission)) {
                    return await originalMethod.apply(this, ...args);
                }
                message.reply('Você não tem privilégios o suficiente para executar esse comando.');
                return;
            },
        };
    };
}

export { hasPermission };
