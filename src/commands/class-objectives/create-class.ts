import { Message, PermissionFlagsBits } from 'discord.js';
import hasPermission from '../../decorators/has-permission';
import ClassFactory from '../../factories/class-objectives/class-factory';
import Command from '../base-command';

export default class CreateClass implements Command {
    @hasPermission(PermissionFlagsBits.ManageRoles)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        if (messageAsList.length > 2 || messageAsList.length <= 1) {
            message.reply(`A classe só pode ter uma palavra,`);
            return;
        }

        const className = messageAsList[1];

        const createdClass = await ClassFactory.getInstance().create({ name: className, guildId: BigInt(message.guildId!) });

        message.reply(`Classe **${createdClass.name}** criada com sucesso.`);
    }
}
