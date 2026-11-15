import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import {
    CreateNPCStrategy,
    DeleteNPCStrategy,
    ListNPCStrategy,
    SwitchNPCStrategy,
} from '../../strategies';

const strategies = {
    create: new CreateNPCStrategy(),
    switch: new SwitchNPCStrategy(),
    delete: new DeleteNPCStrategy(),
    list: new ListNPCStrategy(),
} as const;

export default {
    data: new SlashCommandBuilder()
        .setName('npc')
        .setDescription('Comando principal para NPCs')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('create')
                .setDescription('Criar um novo NPC')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do NPC.')
                        .setRequired(true)
                        .setMaxLength(127),
                )
                .addAttachmentOption((option) =>
                    option.setName('image').setDescription('A imagem do NPC.'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('switch')
                .setDescription('Trocar para um NPC')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do NPC.')
                        .setRequired(true)
                        .setMaxLength(127),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Deletar um NPC')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('O nome do NPC a ser deletado.')
                        .setRequired(true)
                        .setMaxLength(127),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('list').setDescription('Listar todos os seus NPCs.'),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();

        const strategy = strategies[subcommand as keyof typeof strategies];
        if (strategy) {
            return strategy.executeSlashCommand(interaction);
        }
    },
};
