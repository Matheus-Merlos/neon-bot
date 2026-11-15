import { ChatInputCommandInteraction, Message } from 'discord.js';
import { SystemFactory } from '../../factories';
import getTitleAndDescriptionFromStringAsArray from '../../utils/get-title-and-description-from-str-as-array';
import { IStrategy } from '../base-strategy';

type Input = {
    name: string;
    description: string;
};

export default class CreateSystemStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const createdSystem = await SystemFactory.create({
            name: input.name,
            description: input.description,
            guildId: BigInt(replyInstance.guildId!),
        });

        await replyInstance.reply(
            `**Sistema ${createdSystem.id} - ${createdSystem.name}** criado com sucesso.`,
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            name: o.getString('name', true),
            description: o.getString('description', true),
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const parsedMsg = getTitleAndDescriptionFromStringAsArray(messageAsList);
        if (parsedMsg === null) {
            await message.reply(
                [
                    'Não consegui identificar o nome do sistema.',
                    'O nome precisa estar **entre aspas**, seguido da descrição:',
                    '',
                    '`;system create "Nome do sistema" Descrição do sistema`',
                    '',
                    '**Exemplo:**',
                    '`;system create "Sistema de mana" O sistema de mana atribui 2000 de mana a cada personagem...`',
                ].join('\n'),
            );
            return;
        }

        await this.handleInput({ name: parsedMsg.title, description: parsedMsg.rest }, message);
    }
}
