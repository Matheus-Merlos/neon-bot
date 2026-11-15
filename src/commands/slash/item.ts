import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from 'discord.js';
import { item } from '../../db/schema';
import {
    BuyStrategy,
    CreateItemStrategy,
    DeleteStrategy,
    EditFieldStrategy,
    EditImageStrategy,
    EditStrategy,
    GiveItemStrategy,
    InfoStrategy,
    ListStrategy,
    UseStrategy,
} from '../../strategies';
import { ItemFactory } from '../../factories';

const createItemStrategy = new CreateItemStrategy();
const editBuyableStrategy = new EditFieldStrategy(item, ItemFactory, 'canBuy');
const editStrategy = new EditStrategy({
    image: new EditImageStrategy(ItemFactory, item),
    name: new EditFieldStrategy(item, ItemFactory, 'name'),
    buyable: editBuyableStrategy,
    description: new EditFieldStrategy(item, ItemFactory, 'description'),
    price: new EditFieldStrategy(item, ItemFactory, 'price'),
    durability: new EditFieldStrategy(item, ItemFactory, 'durability'),
});
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
        )
        .addSubcommandGroup((group) =>
            group
                .setName('edit')
                .setDescription('Editar propriedades de um item')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('name')
                        .setDescription('Editar o nome de um item')
                        .addStringOption((option) =>
                            option
                                .setName('item')
                                .setDescription('O nome do item a ser editado.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addStringOption((option) =>
                            option
                                .setName('value')
                                .setDescription('O novo nome do item.')
                                .setRequired(true)
                                .setMaxLength(127),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('description')
                        .setDescription('Editar a descrição de um item')
                        .addStringOption((option) =>
                            option
                                .setName('item')
                                .setDescription('O nome do item a ser editado.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addStringOption((option) =>
                            option
                                .setName('value')
                                .setDescription('A nova descrição do item.')
                                .setRequired(true)
                                .setMaxLength(2000),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('price')
                        .setDescription('Editar o preço de um item')
                        .addStringOption((option) =>
                            option
                                .setName('item')
                                .setDescription('O nome do item a ser editado.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addStringOption((option) =>
                            option
                                .setName('value')
                                .setDescription('O novo preço do item.')
                                .setRequired(true),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('durability')
                        .setDescription('Editar a durabilidade de um item')
                        .addStringOption((option) =>
                            option
                                .setName('item')
                                .setDescription('O nome do item a ser editado.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addStringOption((option) =>
                            option
                                .setName('value')
                                .setDescription('A nova durabilidade do item.')
                                .setRequired(true),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('buyable')
                        .setDescription('Editar se o item pode ser comprado')
                        .addStringOption((option) =>
                            option
                                .setName('item')
                                .setDescription('O nome do item a ser editado.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addStringOption((option) =>
                            option
                                .setName('value')
                                .setDescription('Se o item pode ser comprado (true/false).')
                                .setRequired(true),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('image')
                        .setDescription('Editar a imagem de um item')
                        .addStringOption((option) =>
                            option
                                .setName('item')
                                .setDescription('O nome do item a ser editado.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addAttachmentOption((option) =>
                            option
                                .setName('image')
                                .setDescription('A nova imagem do item.')
                                .setRequired(true),
                        ),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        if (subcommandGroup === 'edit') {
            return editStrategy.executeSlashCommand(interaction);
        }

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
