import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from 'discord.js';
import { CreateItemStrategy, DeleteStrategy, ListStrategy } from '../../strategies';
import { ItemFactory } from '../../factories';

const createItemStrategy = new CreateItemStrategy();
const listStrategy = new ListStrategy(
    ItemFactory,
    'Loja',
    Colors.Gold,
    (entry) => {
        return [
            {
                name: `$${entry.price} - ${entry.name}`,
                value: `Durabilidade: ${entry.durability} usos.`,
                inline: false,
            },
            {
                name: ' ',
                value: ' ',
                inline: false,
            },
        ];
    },
    7,
);
const deleteStrategy = new DeleteStrategy(ItemFactory, 'item');

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
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('list').setDescription('Listar todos os itens.'),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('shop').setDescription('Listar todos os itens.'),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Deleta um item específico.')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do item a ser deletado.')
                        .setRequired(true)
                        .setMaxLength(127),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case 'create': {
                return createItemStrategy.executeSlashCommand(interaction);
            }
            case 'list':
            case 'shop': {
                return listStrategy.executeSlashCommand(interaction);
            }
            case 'delete': {
                return deleteStrategy.executeSlashCommand(interaction);
            }
        }
    },
};
