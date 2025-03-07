import { Colors, EmbedBuilder, Message } from 'discord.js';
import ObjectiveDifficultyFactory from '../../factories/objectives/objective-difficulty-factory';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import Strategy from '../base-strategy';

export default class CreateObjectiveStrategy implements Strategy {
    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const expIndex = messageAsList.findIndex((element) => !isNaN(parseInt(element)) && element.trim() !== '');

        const objectiveName = messageAsList.slice(0, expIndex).join(' ').replaceAll('"', '');
        const xp = parseInt(messageAsList[expIndex]);
        const gold = parseInt(messageAsList[expIndex + 1]);
        const description = messageAsList
            .slice(expIndex + 3, messageAsList.length)
            .join(' ')
            .replaceAll('"', '');

        let difficulty;
        try {
            difficulty = await ObjectiveDifficultyFactory.getInstance().getByName(
                messageAsList[expIndex + 2],
                message.guildId!,
            );
        } catch {
            message.reply(`Não existe uma dificuldade de objetivo com o nome **${messageAsList[expIndex + 2]}**.`);
            return;
        }

        const createdObjective = await ObjectiveFactory.getInstance().create({
            name: objectiveName,
            xp,
            gold,
            type: difficulty.id,
            description,
            guildId: BigInt(message.guildId!),
        });

        const objectiveEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle(createdObjective.name)
            .setDescription(`${createdObjective.description}\n**Recompensas:**`)
            .setFields(
                {
                    name: 'XP',
                    value: `${createdObjective.xp}`,
                    inline: true,
                },
                {
                    name: 'Dinheiro',
                    value: `$${createdObjective.gold}`,
                    inline: true,
                },
            );
        message.reply({
            content: `Objetivo **${createdObjective.name}** criado com sucesso!`,
            embeds: [objectiveEmbed],
        });
    }
}
