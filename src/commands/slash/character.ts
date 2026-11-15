import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { character } from '../../db/schema';
import { CharacterFactory } from '../../factories';
import { EditCharacterFieldStrategy, EditImageStrategy, EditStrategy } from '../../strategies';

const strategies = {
    edit: new EditStrategy({
        name: new EditCharacterFieldStrategy('name'),
        image: new EditImageStrategy(CharacterFactory, character),
    }),
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('character')
        .setDescription('Comando principal para personagens')
        .addSubcommandGroup((group) =>
            group
                .setName('edit')
                .setDescription('Editar propriedades do personagem')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('name')
                        .setDescription('Editar o nome do personagem')
                        .addStringOption((option) =>
                            option
                                .setName('value')
                                .setDescription('O novo nome do personagem.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addUserOption((option) =>
                            option
                                .setName('player')
                                .setDescription('Jogador dono do personagem (default: você mesmo)'),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('image')
                        .setDescription('Editar a imagem do personagem')
                        .addAttachmentOption((option) =>
                            option
                                .setName('image')
                                .setDescription('A nova imagem do personagem.')
                                .setRequired(true),
                        )
                        .addUserOption((option) =>
                            option
                                .setName('player')
                                .setDescription('Jogador dono do personagem (default: você mesmo)'),
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
