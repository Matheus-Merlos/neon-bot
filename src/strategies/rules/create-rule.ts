import { Message } from 'discord.js';
import { RuleFactory } from '../../factories';
import getTitleAndDescriptionFromStringAsArray from '../../utils/get-title-and-description-from-str-as-array';
import Strategy from '../base-strategy';

export default class CreateRuleStrategy implements Strategy {
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
        const { title: ruleName, rest: ruleDescription } = parsedMsg;

        const createdRule = await RuleFactory.create({
            name: ruleName,
            description: ruleDescription,
            guildId: BigInt(message.guildId),
        });

        await message.reply(
            `**Regra ${createdRule.id} - ${createdRule.name}** criada com sucesso.`,
        );
    }
}
