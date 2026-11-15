import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import {
    CreateManaAliasStrategy,
    DisableCharacterManaStrategy,
    ManaRegenStrategy,
    SetBaseManaStrategy,
    UseManaStrategy,
} from '../../strategies';

const strategies = {
    disable: new DisableCharacterManaStrategy(),
    'set-base': new SetBaseManaStrategy(),
    use: new UseManaStrategy(),
    regen: new ManaRegenStrategy(),
    alias: new CreateManaAliasStrategy(),
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('mana')
        .setDescription('Comando principal para mana')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('set-base')
                .setDescription('Definir a mana base de um personagem')
                .addNumberOption((option) =>
                    option
                        .setName('value')
                        .setDescription('O valor da mana base.')
                        .setRequired(true),
                )
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription('Jogador a ter a mana definida (default: você mesmo)'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('disable')
                .setDescription('Desabilitar a mana de um personagem')
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription('Jogador a ter a mana desabilitada (default: você mesmo)'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('use')
                .setDescription('Usar mana de um personagem')
                .addStringOption((option) =>
                    option
                        .setName('value')
                        .setDescription(
                            'Quantidade de mana a ser usada (número, porcentagem ou alias).',
                        )
                        .setRequired(true),
                )
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription('Jogador que usará a mana (default: você mesmo)'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('regen')
                .setDescription('Regenerar mana de um personagem')
                .addStringOption((option) =>
                    option
                        .setName('value')
                        .setDescription(
                            'Quantidade de mana a regenerar (número, porcentagem ou "full").',
                        )
                        .setRequired(true),
                )
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription('Jogador que regenerará a mana (default: você mesmo)'),
                ),
        )
        .addSubcommandGroup((group) =>
            group
                .setName('alias')
                .setDescription('Gerenciar aliases de mana')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('create')
                        .setDescription('Criar um alias de mana')
                        .addStringOption((option) =>
                            option
                                .setName('name')
                                .setDescription('O nome do alias.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addNumberOption((option) =>
                            option
                                .setName('value')
                                .setDescription('O valor de mana do alias.')
                                .setRequired(true),
                        )
                        .addUserOption((option) =>
                            option
                                .setName('player')
                                .setDescription('Jogador dono do alias (default: você mesmo)'),
                        ),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = group ?? interaction.options.getSubcommand();

        const strategy = strategies[subcommand as keyof typeof strategies];
        if (strategy) {
            return strategy.executeSlashCommand(interaction);
        }
    },
};
