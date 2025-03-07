import { Message } from 'discord.js';
import ClassFactory from '../../factories/class-objectives/class-factory';
import Strategy from '../base-strategy';

export default class CreateClassStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        if (messageAsList.length > 2 || messageAsList.length <= 1) {
            message.reply(`A classe só pode ter uma palavra,`);
            return;
        }

        const className = messageAsList[1];

        const createdClass = await ClassFactory.getInstance().create({ name: className, guildId: BigInt(message.guildId!) });

        message.reply(`Classe **${createdClass.name}** criada com sucesso.`);
    }
}
