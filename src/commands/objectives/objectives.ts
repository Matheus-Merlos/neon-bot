import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, Message } from 'discord.js';
import { InferSelectModel } from 'drizzle-orm';
import { objective } from '../../db/schema';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import Command from '../base-command';

const OBJECTIVES_PER_PAGE = 5;

export default class Objectives implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const objectives = await ObjectiveFactory.getInstance().getAll();

        const objectiveMatrix: Array<Array<InferSelectModel<typeof objective>>> = [];

        for (let i = 0; i < objectives.length; i += OBJECTIVES_PER_PAGE) {
            const itemSublist = objectives.slice(i, i + OBJECTIVES_PER_PAGE);

            objectiveMatrix.push(itemSublist);
        }

        let currentIndex = 0;

        let objectiveEmbed = this.getObjectiveEmbed(objectiveMatrix[currentIndex], objectiveMatrix.length, currentIndex);

        const forwardButton = new ButtonBuilder().setCustomId('forward').setLabel('Próximo').setStyle(ButtonStyle.Primary);

        const backwardsButton = new ButtonBuilder()
            .setCustomId('backward')
            .setLabel('Anterior')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        if (objectiveMatrix.length == currentIndex + 1) {
            forwardButton.setDisabled(true);
        }

        let row = new ActionRowBuilder<ButtonBuilder>().addComponents(backwardsButton, forwardButton);

        const objectiveMessage = await message.reply({ embeds: [objectiveEmbed], components: [row] });

        try {
            const collector = objectiveMessage.createMessageComponentCollector({ time: 60_000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'forward') currentIndex++;
                if (interaction.customId === 'backward') currentIndex--;

                forwardButton.setDisabled(currentIndex === objectiveMatrix.length - 1);
                backwardsButton.setDisabled(currentIndex === 0);

                objectiveEmbed = this.getObjectiveEmbed(objectiveMatrix[currentIndex], objectiveMatrix.length, currentIndex);

                row = new ActionRowBuilder<ButtonBuilder>().addComponents(backwardsButton, forwardButton);

                await interaction.deferUpdate();
                await objectiveMessage.edit({ embeds: [objectiveEmbed], components: [row] });
            });
        } catch {
            return;
        }
    }

    private getObjectiveEmbed(
        objectives: Array<InferSelectModel<typeof objective>>,
        totalPages: number,
        currentIndex: number,
    ): EmbedBuilder {
        const objectiveEmbed = new EmbedBuilder()
            .setTitle('Objetivos')
            .setColor(Colors.Blue)
            .setFooter({ text: `Página ${currentIndex + 1}/${totalPages}` });

        objectives.forEach((objective) => {
            objectiveEmbed.addFields(
                {
                    name: objective.name,
                    value: `XP: ${objective.xp}, dinheiro: ${objective.gold}`,
                    inline: false,
                },
                {
                    name: ' ',
                    value: ' ',
                    inline: false,
                },
            );
        });

        return objectiveEmbed;
    }
}
