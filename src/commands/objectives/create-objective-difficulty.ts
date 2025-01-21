import { Message, PermissionFlagsBits } from 'discord.js';
import hasPermission from '../../decorators/has-permission';
import { default as ObjectiveDifficultyFactory } from '../../factories/objectives/objective-difficulty-factory';
import Command from '../base-command';

export default class CreateObjectiveDifficulty implements Command {
    @hasPermission(PermissionFlagsBits.Administrator)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
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

        const createdDifficulty = await ObjectiveDifficultyFactory.getInstance().create(name);

        message.reply(`Criado com sucesso a dificuldade **${createdDifficulty.name}**`);
    }
}
