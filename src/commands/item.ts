import { Colors, PermissionFlagsBits } from 'discord.js';
import { item } from '../db/schema';
import { HasStrategyPermission } from '../decorators';
import ItemFactory from '../factories/item-factory';
import {
    BuyStrategy,
    CreateItemStrategy,
    DefaultStrategy,
    DeleteStrategy,
    EditFieldStrategy,
    EditImageStrategy,
    EditStrategy,
    GiveItemStrategy,
    InfoStrategy,
    ListStrategy,
    UseStrategy,
} from '../strategies';
import { StrategyCommand } from './base-command';

export default class Item extends StrategyCommand {
    constructor() {
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
        const editBuyableStrategy = new EditFieldStrategy(item, ItemFactory, 'canBuy');
        super(
            'item',
            {
                create: new HasStrategyPermission(
                    new CreateItemStrategy(),
                    PermissionFlagsBits.ManageChannels,
                ),
                info: new InfoStrategy(ItemFactory),
                list: listStrategy,
                shop: listStrategy,
                delete: new HasStrategyPermission(
                    new DeleteStrategy(ItemFactory, 'item'),
                    PermissionFlagsBits.ManageChannels,
                ),
                buy: new BuyStrategy(),
                give: new HasStrategyPermission(
                    new GiveItemStrategy(),
                    PermissionFlagsBits.ManageGuild,
                ),
                use: new UseStrategy(),
                edit: new EditStrategy({
                    image: new HasStrategyPermission(
                        new EditImageStrategy(ItemFactory, item),
                        PermissionFlagsBits.ManageChannels,
                    ),
                    name: new EditFieldStrategy(item, ItemFactory, 'name'),
                    buyable: editBuyableStrategy,
                    canBuy: editBuyableStrategy,
                    compravel: editBuyableStrategy,
                    description: new EditFieldStrategy(item, ItemFactory, 'description'),
                    price: new EditFieldStrategy(item, ItemFactory, 'price'),
                    durability: new EditFieldStrategy(item, ItemFactory, 'durability'),
                }),
            },
            new DefaultStrategy('item', {
                create: 'Cria um item para o servidor.\n`;item create <nome> <preco> <durabilidade> <descricao>`.',
                info: 'Mostra detalhes específicos de um item\n`;item info <nome_item>`',
                delete: 'Deleta um item específico.\n`;item delete <nome_item>`.',
                list: 'Mostra todos os itens servidor.',
                shop: 'Um apelido para o comando de "list"',
                buy: 'Compra um item para seu personagem atual, descontando o dinheiro necessário.`;item buy <nome_item>`',
                give: 'Dá um item para um jogador específico.\n`;item give <@menção> <quantidade(opcional, padrão=1)> <nome_item>`',
                use: 'Usa um item específico\n`;item use <quantidade(opcional, padrão=1)> <nome_item>`',
                edit: 'Edita alguma característica de um item\n`;item edit <image> <nome_item> <anexar imagem nova>`',
            }),
        );
    }
}
