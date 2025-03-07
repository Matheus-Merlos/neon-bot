import { Message } from 'discord.js';
import ObjectiveDifficultyFactory from '../../factories/objectives/objective-difficulty-factory';
import Strategy from '../base-strategy';

export default class CreateObjectiveDifficultyStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        if (messageAsList.length > 1) {
            message.reply(`A dificuldade deve ter apenas uma palavra.`);
            return;
        }
        const name = messageAsList[0];

        if (!isNaN(parseInt(name))) {
            message.reply(`O nome não ser um número`);
            return;
        }

        if (!name) {
            message.reply(`Você não forneceu um nome válido.`);
            return;
        }

        const createdDifficulty = await ObjectiveDifficultyFactory.getInstance().create({
            name,
            guildId: BigInt(message.guildId),
        });

        message.reply(`Criado com sucesso a dificuldade **${createdDifficulty.name}**`);
    }
}
