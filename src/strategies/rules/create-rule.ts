import { ChatInputCommandInteraction, Message } from 'discord.js';
import { RuleFactory } from '../../factories';
import getTitleAndDescriptionFromStringAsArray from '../../utils/get-title-and-description-from-str-as-array';
import { IStrategy } from '../base-strategy';

type Input = {
    name: string;
    description: string;
};

export default class CreateRuleStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const createdRule = await RuleFactory.create({
            name: input.name,
            description: input.description,
            guildId: BigInt(replyInstance.guildId!),
        });

        await replyInstance.reply(
            `**Regra ${createdRule.id} - ${createdRule.name}** criada com sucesso.`,
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
                    'Não consegui identificar o nome da regra.',
                    'O nome precisa estar **entre aspas**, seguido da descrição:',
                    '',
                    '`;rule create "Nome da regra" Descrição da regra`',
                    '',
                    '**Exemplo:**',
                    '`;rule create "Regra 01 - Habilidades Passivas" Toda habilidade dá no máximo +2 em um atributo`',
                ].join('\n'),
            );
            return;
        }

        await this.handleInput({ name: parsedMsg.title, description: parsedMsg.rest }, message);
    }
}
