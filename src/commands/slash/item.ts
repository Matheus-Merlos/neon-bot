import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CreateItemStrategy } from '../../strategies';

export default {
    data: new SlashCommandBuilder()
        .setName('item')
        .setDescription('Comando principal para itens')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('create')
                .setDescription('Subcomando para criação de itens')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do item a ser criado.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addNumberOption((option) =>
                    option
                        .setName('durability')
                        .setDescription('A durabilidade do item a ser criado (padrão: 1).'),
                )
                .addBooleanOption((option) =>
                    option.setName('buyable').setDescription('O item pode ser comprado?'),
                )
                .addNumberOption((option) =>
                    option.setName('price').setDescription('O preço em gold do item a ser criado.'),
                )
                .addStringOption((option) =>
                    option
                        .setName('description')
                        .setDescription('A descrição do item.')
                        .setMaxLength(2000),
                )
                .addAttachmentOption((option) =>
                    option.setName('image').setDescription('A imagem do item.'),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case 'create': {
                return CreateItemStrategy.executeSlashCommand(interaction);
            }
        }
    },
};
