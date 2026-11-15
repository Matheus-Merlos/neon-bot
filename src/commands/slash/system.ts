import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from 'discord.js';
import { system } from '../../db/schema';
import { SystemFactory } from '../../factories';
import {
    CreateSystemStrategy,
    DeleteStrategy,
    EditFieldStrategy,
    EditStrategy,
    InfoStrategy,
    ListStrategy,
} from '../../strategies';

const listStrategy = new ListStrategy(
    SystemFactory,
    'Sistemas',
    Colors.DarkBlue,
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
    create: new CreateSystemStrategy(),
    list: listStrategy,
    delete: new DeleteStrategy(SystemFactory, 'sistema'),
    info: new InfoStrategy(SystemFactory),
    edit: new EditStrategy({
        name: new EditFieldStrategy(system, SystemFactory, 'name'),
        description: new EditFieldStrategy(system, SystemFactory, 'description'),
    }),
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('system')
        .setDescription('Comando principal para sistemas')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('create')
                .setDescription('Criar um novo sistema')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do sistema.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addStringOption((option) =>
                    option
                        .setName('description')
                        .setDescription('A descrição do sistema.')
                        .setMaxLength(2000),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('list').setDescription('Listar todos os sistemas.'),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Deletar um sistema específico.')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do sistema a ser deletado.')
                        .setRequired(true)
                        .setMaxLength(127),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('info')
                .setDescription('Informações sobre um sistema específico')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do sistema a ser pesquisado.')
                        .setRequired(true)
                        .setMaxLength(127),
                ),
        )
        .addSubcommandGroup((group) =>
            group
                .setName('edit')
                .setDescription('Editar propriedades de um sistema')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('name')
                        .setDescription('Editar o nome de um sistema')
                        .addStringOption((option) =>
                            option
                                .setName('item')
                                .setDescription('O nome do sistema a ser editado.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addStringOption((option) =>
                            option
                                .setName('value')
                                .setDescription('O novo nome do sistema.')
                                .setRequired(true)
                                .setMaxLength(127),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('description')
                        .setDescription('Editar a descrição de um sistema')
                        .addStringOption((option) =>
                            option
                                .setName('item')
                                .setDescription('O nome do sistema a ser editado.')
                                .setRequired(true)
                                .setMaxLength(127),
                        )
                        .addStringOption((option) =>
                            option
                                .setName('value')
                                .setDescription('A nova descrição do sistema.')
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
