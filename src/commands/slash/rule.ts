import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from 'discord.js';
import { rule } from '../../db/schema';
import { RuleFactory } from '../../factories';
import {
    CreateRuleStrategy,
    DeleteStrategy,
    EditFieldStrategy,
    EditStrategy,
    InfoStrategy,
    ListStrategy,
} from '../../strategies';

const listStrategy = new ListStrategy(
    RuleFactory,
    'Regras',
    Colors.DarkRed,
    (entry) => {
        return [
            {
                name: entry.name,
                value: entry.description ?? 'Sem descrição',
                inline: false,
            },
        ];
    },
    5,
);

const strategies = {
    create: new CreateRuleStrategy(),
    list: listStrategy,
    delete: new DeleteStrategy(RuleFactory, 'regra'),
    info: new InfoStrategy(RuleFactory),
    edit: new EditStrategy({
        name: new EditFieldStrategy(rule, RuleFactory, 'name'),
        description: new EditFieldStrategy(rule, RuleFactory, 'description'),
    }),
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('rule')
        .setDescription('Comando principal para regras')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('create')
                .setDescription('Criar uma nova regra')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da regra.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addStringOption((option) =>
                    option
                        .setName('description')
                        .setDescription('A descrição da regra.')
                        .setMaxLength(2000),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('list').setDescription('Listar todas as regras.'),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Deletar uma regra específica.')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da regra a ser deletada.')
                        .setRequired(true)
                        .setMaxLength(127),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('info')
                .setDescription('Informações sobre uma regra específica')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da regra a ser pesquisada.')
                        .setRequired(true)
                        .setMaxLength(127),
                ),
        )
        .addSubcommandGroup((group) =>
            group
                .setName('edit')
                .setDescription('Editar propriedades de uma regra')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('name')
                        .setDescription('Editar o nome de uma regra')
                        .addStringOption((option) =>
                            option
                                .setName('item')
                                .setDescription('O nome da regra a ser editada.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addStringOption((option) =>
                            option
                                .setName('value')
                                .setDescription('O novo nome da regra.')
                                .setRequired(true)
                                .setMaxLength(127),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('description')
                        .setDescription('Editar a descrição de uma regra')
                        .addStringOption((option) =>
                            option
                                .setName('item')
                                .setDescription('O nome da regra a ser editada.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addStringOption((option) =>
                            option
                                .setName('value')
                                .setDescription('A nova descrição da regra.')
                                .setRequired(true)
                                .setMaxLength(2000),
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
