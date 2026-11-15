import { ChatInputCommandInteraction, Message } from 'discord.js';
import db from '../../db/db';
import { inventory } from '../../db/schema';
import CharacterFactory from '../../factories/character-factory';
import ItemFactory from '../../factories/item-factory';
import getIdFromMention from '../../utils/get-id-from-mention';
import Strategy, { IStrategy } from '../base-strategy';

type Input = {
    name: string;
    quantity: number;
    user: string;
};

export default class GiveItemStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const char = await CharacterFactory.getFromPlayerId(input.user, replyInstance.guildId!);

        let item;

        try {
            item = await ItemFactory.getByName(input.name, replyInstance.guildId!);
        } catch {
            await replyInstance.reply(`Não foi encontrado um item com o nome **${input.name}**.`);
            return;
        }

        for (let i = 0; i < input.quantity; i++)
            await db
                .insert(inventory)
                .values({ itemId: item.id, characterId: char.id, durability: item.durability });

        replyInstance.reply(
            `Você deu com sucesso **${input.quantity}**x **${item.name}** para ${char.name}`,
        );
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const o = interaction.options;

        const item = {
            name: o.getString('name', true),
            quantity: o.getNumber('quantity') ?? 1,
            user: o.getUser('player')?.id ?? interaction.user.id,
        };

        await this.handleInput(item, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        let quantity = 1;
        let player: string;
        if (messageAsList[0].includes('@')) {
            player = getIdFromMention(messageAsList[0]);
        } else {
            player = message.author.id;
        }

        messageAsList.splice(0, 1);
        if (!isNaN(parseInt(messageAsList[0]))) {
            quantity = parseInt(messageAsList[0]);
            messageAsList.splice(0, 1);
        }
        const itemName = messageAsList.join(' ');

        await this.handleInput({ name: itemName, user: player, quantity }, message);
    }
}
