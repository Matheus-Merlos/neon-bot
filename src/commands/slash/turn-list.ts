import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import TurnListStrategy from '../../strategies/rpg/turn-list';

const strategy = new TurnListStrategy();

export default {
    data: new SlashCommandBuilder()
        .setName('turn-list')
        .setDescription('Gerar uma lista de turnos para combate')
        .addStringOption((option) =>
            option
                .setName('foes')
                .setDescription(
                    'Nomes dos inimigos separados por vírgula (ex: Goblin, Orc, Dragão)',
                ),
        )
        .addUserOption((option) => option.setName('player1').setDescription('Jogador participante'))
        .addUserOption((option) => option.setName('player2').setDescription('Jogador participante'))
        .addUserOption((option) => option.setName('player3').setDescription('Jogador participante'))
        .addUserOption((option) => option.setName('player4').setDescription('Jogador participante'))
        .addUserOption((option) => option.setName('player5').setDescription('Jogador participante'))
        .addUserOption((option) => option.setName('player6').setDescription('Jogador participante'))
        .addUserOption((option) => option.setName('player7').setDescription('Jogador participante'))
        .addUserOption((option) => option.setName('player8').setDescription('Jogador participante'))
        .addUserOption((option) => option.setName('player9').setDescription('Jogador participante'))
        .addUserOption((option) =>
            option.setName('player10').setDescription('Jogador participante'),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await strategy.executeSlashCommand(interaction);
    },
};
