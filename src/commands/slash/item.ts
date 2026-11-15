import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from 'discord.js';
import {
    BuyStrategy,
    CreateItemStrategy,
    DeleteStrategy,
    GiveItemStrategy,
    InfoStrategy,
    ListStrategy,
    UseStrategy,
} from '../../strategies';
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
const infoStrategy = new InfoStrategy(ItemFactory);
const buyStrategy = new BuyStrategy();
const giveStrategy = new GiveItemStrategy();
const useStrategy = new UseStrategy();

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
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('info')
                .setDescription('Informações sobre um item específico')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do item a ser pesquisado.')
                        .setRequired(true)
                        .setMaxLength(127),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('buy')
                .setDescription('Comprar um item específico')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do item a ser comprado.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addNumberOption((option) =>
                    option
                        .setName('quantity')
                        .setDescription('Quantidade do item a ser comprada (default: 1, max: 100).')
                        .setMaxValue(100),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('give')
                .setDescription('Dar um item a algum player')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do item a ser dado.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addUserOption((option) =>
                    option
                        .setName('player')
                        .setDescription('Jogador que receberá o item (default: você mesmo)'),
                )
                .addNumberOption((option) =>
                    option
                        .setName('quantity')
                        .setDescription('Quantidade do item a ser dada (default: 1, max: 100).')
                        .setMaxValue(100),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('use')
                .setDescription('Usar um item do seu inventário')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do item a ser usado.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addNumberOption((option) =>
                    option
                        .setName('quantity')
                        .setDescription(
                            'Quantidade de vezes que o item será utilizado (default: 1, max: 100).',
                        )
                        .setMaxValue(100),
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
            case 'info': {
                return infoStrategy.executeSlashCommand(interaction);
            }
            case 'buy': {
                return buyStrategy.executeSlashCommand(interaction);
            }
            case 'give': {
                return giveStrategy.executeSlashCommand(interaction);
            }
            case 'use': {
                return useStrategy.executeSlashCommand(interaction);
            }
        }
    },
};
