import { ChatInputCommandInteraction, Message } from 'discord.js';
import { CharacterFactory, ManaAliasFactory } from '../../../factories';
import { getCharacter } from '../../../utils';
import { IStrategy } from '../../base-strategy';

type Input = {
    playerId: string;
    value: number;
    aliasName: string;
};

export default class CreateManaAliasStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const character = await CharacterFactory.getFromPlayerId(
            input.playerId,
            replyInstance.guildId!,
        );

        const createdAlias = await ManaAliasFactory.create({
            name: input.aliasName,
            value: input.value,
            character: character.id,
            guildId: BigInt(replyInstance.guildId!),
        });

        replyInstance.reply(
            `Alias **${createdAlias.name}** criado para o personagem **${character.name}** com o valor de **${input.value}** de mana.`,
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            playerId: o.getUser('player')?.id ?? interaction.user.id,
            value: o.getNumber('value', true),
            aliasName: o.getString('name', true),
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const character = await getCharacter(message, messageAsList);

        const value = parseInt(messageAsList[0]);
        messageAsList.splice(0, 1);
        const aliasName = messageAsList.join(' ');

        if (isNaN(value)) {
            message.reply(
                `Ops! O valor \`${messageAsList[0]}\` não é um número válido.\nPor favor, tente novamente enviando apenas o valor numérico, por exemplo: \`100\`.`,
            );
            return;
        }

        if (!aliasName) {
            message.reply(
                `Ops! O nome do *alias* não é valido.\nPor favor, tente novamente enviando um nome após o número específico.`,
            );
            return;
        }

        await this.handleInput({ playerId: `${character.player}`, value, aliasName }, message);
    }
}
