import { Message, PermissionFlagsBits } from 'discord.js';
import hasPermission from '../../decorators/has-permission';
import ClassFactory from '../../factories/class-objectives/class-factory';
import ClassObjectiveFactory from '../../factories/class-objectives/class-objective-factory';
import Command from '../base-command';

export default class CreateClassObjective implements Command {
    @hasPermission(PermissionFlagsBits.ManageRoles)
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        messageAsList.splice(0, 1);
        const clsName = messageAsList[0];

        let cls;
        try {
            cls = await ClassFactory.getInstance().getByName(clsName, message.guildId!);
        } catch {
            message.reply(`Não foi encontrado uma classe com o nome **${clsName}**`);
            return;
        }

        messageAsList.splice(0, 1);

        const expIndex = messageAsList.findIndex((element) => !isNaN(parseInt(element)) && element.trim() !== '');

        const objectiveName = messageAsList.slice(0, expIndex).join(' ').replaceAll('"', '');
        const xp = parseInt(messageAsList[expIndex]);
        const gold = parseInt(messageAsList[expIndex + 1]);
        const description = messageAsList
            .slice(expIndex + 2, messageAsList.length)
            .join(' ')
            .replaceAll('"', '');

        const created = await ClassObjectiveFactory.getInstance().create(
            objectiveName,
            xp,
            gold,
            cls.id,
            description,
            message.guildId!,
        );

        message.reply(`Objetivo de classe **${created.name}** criado com sucesso para a classe **${cls.name}**`);
        return;
    }
}
