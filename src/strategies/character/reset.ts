import { ChatInputCommandInteraction, Message } from 'discord.js';
import CharacterFactory from '../../factories/character-factory';
import addConfirmation from '../../utils/confirmation-row';
import { IStrategy } from '../base-strategy';

type Input = {
    playerId: string;
};

export default class ResetCharacterStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const userId = 'author' in replyInstance ? replyInstance.author.id : replyInstance.user.id;

        await addConfirmation({
            replyInstance,
            confirmationMsgContent: `Atenção: Isso irá deletar tudo relacionado ao personagem de **<@${input.playerId}>**. Você tem certeza que quer fazer isso?`,
            timeToInteract: 30_000,
            interactionFilter: (i) => i.user.id === userId,
            actions: {
                async callbackFnAccept(confirmationMessage: Message) {
                    const char = await CharacterFactory.getFromPlayerId(
                        input.playerId,
                        replyInstance.guildId!,
                    );

                    await CharacterFactory.delete(char.id);

                    await confirmationMessage.edit({
                        content: `Personagem de **<@${input.playerId}>** resetado com sucesso.`,
                        components: [],
                    });
                },
                callbackFnDecline() {
                    throw new Error();
                },
            },
        });
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const playerId = interaction.options.getUser('player')?.id ?? interaction.user.id;
        await this.handleInput({ playerId }, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const playerId = messageAsList[0]
            ? messageAsList[0].replace(/[<@!>]/g, '')
            : message.author.id;
        await this.handleInput({ playerId }, message);
    }
}
