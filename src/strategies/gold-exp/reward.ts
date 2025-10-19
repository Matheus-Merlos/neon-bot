import { Message } from 'discord.js';
import { CharacterFactory } from '../../factories';
import characterFactory from '../../factories/character-factory';
import checkCaracterLevelUp from '../../utils/check-character-levelup';
import getIdFromMention from '../../utils/get-id-from-mention';
import Strategy from '../base-strategy';

type Operation = 'add' | 'remove';
type RewardAttribute = 'gold' | 'xp';

const operationSymbols = {
    add: '+',
    remove: '-',
};

export default class RewardStrategy implements Strategy {
    constructor(
        private readonly operation: Operation,
        private readonly attribute: RewardAttribute,
    ) {}

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const quantity = parseInt(messageAsList[0]);

        if (isNaN(quantity)) {
            message.reply(
                `Quantidade inválida: **${quantity}**\nSintaxe correta: \`${process.env.PREFIX!}${this.attribute} ${this.operation} <quantidade> <@Menções>\``,
            );
            return;
        }

        messageAsList.splice(0, 1);

        const playersId = messageAsList.map((mention) => getIdFromMention(mention));
        const characters = [];
        for (const playerId of playersId) {
            characters.push(await CharacterFactory.getFromPlayerId(playerId, message.guild!.id));
        }

        for (const char of characters) {
            if (this.operation === 'add' && this.attribute === 'xp')
                await checkCaracterLevelUp(message, char, quantity);

            if (eval(`${char[this.attribute]}${operationSymbols[this.operation]}${quantity}`) < 0) {
                await message.reply(
                    `O personagem **${char.name}** nem possui essa quantidade de ${this.attribute}.`,
                );
                return;
            }

            await characterFactory.edit(char.id, {
                [this.attribute]: char[this.attribute] + quantity,
            });

            await message.reply(
                `**${quantity}** de ${this.operation} adicionado com sucesso para **${char.name}**`,
            );
        }
    }
}
