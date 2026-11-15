import { ChatInputCommandInteraction, Message } from 'discord.js';
import { CharacterFactory } from '../../factories';
import characterFactory from '../../factories/character-factory';
import checkCaracterLevelUp from '../../utils/check-character-levelup';
import getIdFromMention from '../../utils/get-id-from-mention';
import { IStrategy } from '../base-strategy';

type Operation = 'add' | 'remove';
type RewardAttribute = 'gold' | 'xp';

const operationSymbols = {
    add: '+',
    remove: '-',
};

type Input = {
    quantity: number;
    playerIds: string[];
};

export default class RewardStrategy implements IStrategy<Input> {
    constructor(
        private readonly operation: Operation,
        private readonly attribute: RewardAttribute,
    ) {}

    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const { quantity, playerIds } = input;

        const characters = [];
        for (const playerId of playerIds) {
            characters.push(
                await CharacterFactory.getFromPlayerId(playerId, replyInstance.guildId!),
            );
        }

        for (const char of characters) {
            if (this.operation === 'add' && this.attribute === 'xp')
                await checkCaracterLevelUp(replyInstance as Message<true>, char, quantity);

            if (eval(`${char[this.attribute]}${operationSymbols[this.operation]}${quantity}`) < 0) {
                await replyInstance.reply(
                    `O personagem **${char.name}** nem possui essa quantidade de ${this.attribute}.`,
                );
                return;
            }

            await characterFactory.edit(char.id, {
                [this.attribute]: eval(
                    `${char[this.attribute]}${operationSymbols[this.operation]}${quantity}`,
                ),
            });

            await replyInstance.reply(
                `**${quantity}** de ${this.attribute} ${this.operation === 'add' ? 'adicionado' : 'removido'} com sucesso para **${char.name}**`,
            );
        }
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const player = o.getUser('player') ?? interaction.user;

        const input = {
            quantity: o.getNumber('value', true),
            playerIds: [player.id],
        };

        await this.handleInput(input, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const quantity = parseInt(messageAsList[0]);

        if (isNaN(quantity)) {
            message.reply(
                `Quantidade inválida: **${quantity}**\nSintaxe correta: \`${process.env.PREFIX!}${this.attribute} ${this.operation} <quantidade> <@Menções>\``,
            );
            return;
        }

        messageAsList.splice(0, 1);
        const playerIds = messageAsList.map((mention) => getIdFromMention(mention));

        await this.handleInput({ quantity, playerIds }, message);
    }
}
