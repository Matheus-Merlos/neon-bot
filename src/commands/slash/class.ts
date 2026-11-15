import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from 'discord.js';
import ClassFactory from '../../factories/class-objectives/class-factory';
import { CreateStrategy, DeleteStrategy, ListStrategy, SetClassStrategy } from '../../strategies';

const strategies = {
    create: new CreateStrategy(ClassFactory, 'classe'),
    list: new ListStrategy(ClassFactory, 'Classes', Colors.Yellow, (entry) => {
        return [
            {
                name: `${entry.name}`,
                value: ' ',
                inline: false,
            },
            {
                name: ' ',
                value: ' ',
                inline: false,
            },
        ];
    }),
    delete: new DeleteStrategy(ClassFactory, 'classe'),
    set: new SetClassStrategy(),
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('class')
        .setDescription('Comando para gerenciar classes')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('create')
                .setDescription('Criar uma nova classe')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da classe (apenas uma palavra).')
                        .setRequired(true)
                        .setMaxLength(50),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('list').setDescription('Listar todas as classes.'),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Deletar uma classe.')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da classe a ser deletada.')
                        .setRequired(true)
                        .setMaxLength(50),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('set')
                .setDescription('Definir a classe de um personagem')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome da classe.')
                        .setRequired(true)
                        .setMaxLength(50),
                )
                .addUserOption((option) =>
                    option.setName('player').setDescription('O jogador (padrão: você).'),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();

        const strategy = strategies[subcommand as keyof typeof strategies];
        if (strategy) {
            return strategy.executeSlashCommand(interaction);
        }
    },
};
