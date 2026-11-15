import { ChatInputCommandInteraction, Colors, EmbedBuilder, Message } from 'discord.js';
import ObjectiveDifficultyFactory from '../../factories/objectives/objective-difficulty-factory';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import { IStrategy } from '../base-strategy';

type Input = {
    name: string;
    xp: number;
    gold: number;
    difficultyName: string;
    description: string;
};

export default class CreateObjectiveStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        let difficulty;
        try {
            difficulty = await ObjectiveDifficultyFactory.getByName(
                input.difficultyName,
                replyInstance.guildId!,
            );
        } catch {
            replyInstance.reply(
                `Não existe uma dificuldade de objetivo com o nome **${input.difficultyName}**.`,
            );
            return;
        }

        const createdObjective = await ObjectiveFactory.create({
            name: input.name,
            xp: input.xp,
            gold: input.gold,
            type: difficulty.id,
            description: input.description,
            guildId: BigInt(replyInstance.guildId!),
        });

        const objectiveEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle(createdObjective.name)
            .setDescription(`${createdObjective.description}\n**Recompensas:**`)
            .setFields(
                { name: 'XP', value: `${createdObjective.xp}`, inline: true },
                { name: 'Dinheiro', value: `$${createdObjective.gold}`, inline: true },
            );

        replyInstance.reply({
            content: `Objetivo **${createdObjective.name}** criado com sucesso!`,
            embeds: [objectiveEmbed],
        });
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            name: o.getString('name', true),
            xp: o.getNumber('xp', true),
            gold: o.getNumber('gold', true),
            difficultyName: o.getString('difficulty', true),
            description: o.getString('description') ?? '',
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const expIndex = messageAsList.findIndex(
            (element) => !isNaN(parseInt(element)) && element.trim() !== '',
        );

        const name = messageAsList.slice(0, expIndex).join(' ').replaceAll('"', '');
        const xp = parseInt(messageAsList[expIndex]);
        const gold = parseInt(messageAsList[expIndex + 1]);
        const difficultyName = messageAsList[expIndex + 2];
        const description = messageAsList
            .slice(expIndex + 3, messageAsList.length)
            .join(' ')
            .replaceAll('"', '');

        await this.handleInput({ name, xp, gold, difficultyName, description }, message);
    }
}
