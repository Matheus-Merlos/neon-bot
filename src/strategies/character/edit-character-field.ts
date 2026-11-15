import { ChatInputCommandInteraction, Message } from 'discord.js';
import { eq, InferInsertModel } from 'drizzle-orm';
import db from '../../db/db';
import { character } from '../../db/schema';
import { CharacterFactory } from '../../factories';
import { getCharacter } from '../../utils';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
    value: string;
};

export default class EditCharacterFieldStrategy implements IStrategy<Input> {
    constructor(private readonly field: keyof InferInsertModel<typeof character>) {}

    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const char = await CharacterFactory.getFromPlayerId(input.playerId, replyInstance.guildId!);

        const newValue = input.value.replaceAll('"', '').replaceAll("'", '');
        if (newValue.length === 0) {
            replyInstance.reply('Você não forneceu um valor válido');
            return;
        }

        await db
            .update(character)
            .set({
                [this.field]: newValue,
            })
            .where(eq(character.id, char.id));

        await replyInstance.reply('Personagem editado com sucesso.');
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const input = {
            playerId: o.getUser('player')?.id ?? interaction.user.id,
            value: o.getString('value', true),
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const char = await getCharacter(message, messageAsList);
        const value = messageAsList.join(' ');

        await this.handleInput({ playerId: `${char.player}`, value }, message);
    }
}
