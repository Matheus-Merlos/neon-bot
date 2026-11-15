import { ChatInputCommandInteraction, Message } from 'discord.js';
import ClassFactory from '../../factories/class-objectives/class-factory';
import ClassObjectiveFactory from '../../factories/class-objectives/class-objective-factory';
import { IStrategy } from '../base-strategy';

type Input = {
    className: string;
    name: string;
    xp: number;
    gold: number;
    description: string;
};

export default class CreateClassObjectiveStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        let cls;
        try {
            cls = await ClassFactory.getByName(input.className, replyInstance.guildId!);
        } catch {
            replyInstance.reply(`Não foi encontrado uma classe com o nome **${input.className}**`);
            return;
        }

        const created = await ClassObjectiveFactory.create({
            name: input.name,
            xp: input.xp,
            gold: input.gold,
            classId: cls.id,
            description: input.description,
            guildId: BigInt(replyInstance.guildId!),
        });

        replyInstance.reply(
            `Objetivo de classe **${created.name}** criado com sucesso para a classe **${cls.name}**`,
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            className: o.getString('class', true),
            name: o.getString('name', true),
            xp: o.getNumber('xp', true),
            gold: o.getNumber('gold', true),
            description: o.getString('description') ?? '',
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const className = messageAsList[0];
        messageAsList.splice(0, 1);

        const expIndex = messageAsList.findIndex(
            (element) => !isNaN(parseInt(element)) && element.trim() !== '',
        );

        const name = messageAsList.slice(0, expIndex).join(' ').replaceAll('"', '');
        const xp = parseInt(messageAsList[expIndex]);
        const gold = parseInt(messageAsList[expIndex + 1]);
        const description = messageAsList
            .slice(expIndex + 2, messageAsList.length)
            .join(' ')
            .replaceAll('"', '');

        await this.handleInput({ className, name, xp, gold, description }, message);
    }
}
