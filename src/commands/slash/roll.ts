import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

function roll(rollText: string): { results: number[]; dice: number } {
    let quantity = 1;
    let dice: number;

    if (rollText.includes('d')) {
        [quantity, dice] = rollText.split('d').map((entry) => parseInt(entry));
    } else {
        dice = parseInt(rollText);
    }

    const rolls: number[] = [];
    for (let i = 0; i < quantity; i++) {
        rolls.push(Math.floor(Math.random() * dice) + 1);
    }

    return { results: rolls, dice };
}

export default {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolar dados')
        .addStringOption((option) =>
            option.setName('dice').setDescription('Formato do dado (ex: 2d6, 1d20). Default: 1d6'),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const diceInput = interaction.options.getString('dice') ?? '1d6';
        const results = roll(diceInput);

        interaction.reply(
            `Você rolou um \`${results.results.length}d${results.dice}\` e conseguiu ${results.results}.`,
        );
    },
};
