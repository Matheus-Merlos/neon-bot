import { Message } from 'discord.js';
import Command from '../commands/base-command';

function errorMsg(messageIndexMention: number): string {
    return `
Erro de sintaxe no comando. 
O ${messageIndexMention + 1}° argumento deve ser uma @menção a um usuário específico. Verifique se você mencionou corretamente o usuário e tente novamente.
`;
}

export default function hasMention(messageIndexMention: number = 1) {
    return function (classPrototype: Command, methodName: string, descriptor: PropertyDescriptor) {
        const callable = descriptor.value;
        async function wrapper(message: Message, messageAsList: Array<string>) {
            if (messageAsList.length === 1 || messageAsList[messageIndexMention].includes('@')) {
                await callable(message, messageAsList);
                return;
            }
            await message.reply(errorMsg(messageIndexMention));
            return;
        }
        return {
            value: wrapper,
        };
    };
}
