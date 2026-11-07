import { Message } from 'discord.js';
import { SystemFactory } from '../../factories';
import getTitleAndDescriptionFromStringAsArray from '../../utils/get-title-and-description-from-str-as-array';
import Strategy from '../base-strategy';

export default class CreateSystemStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const parsedMsg = getTitleAndDescriptionFromStringAsArray(messageAsList);
        if (parsedMsg === null) {
            await message.reply(
                [
                    'Não consegui identificar o nome do sistema.',
                    'O nome precisa estar **entre aspas**, seguido da descrição:',
                    '',
                    '`;system create "Nome do sistema" Descrição do sistema`',
                    '',
                    '**Exemplo:**',
                    '`;system create "Sistema de mana" O sistema de mana atribui 2000 de mana a cada personagem...`',
                ].join('\n'),
            );
            return;
        }
        const { title: name, rest: description } = parsedMsg;

        const createdSystem = await SystemFactory.create({
            name,
            description,
            guildId: BigInt(message.guildId),
        });

        await message.reply(
            `**Sistema ${createdSystem.id} - ${createdSystem.name}** criado com sucesso.`,
        );
    }
}
