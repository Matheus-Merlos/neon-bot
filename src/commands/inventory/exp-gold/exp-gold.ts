import { Message } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../../../db/db';
import { character } from '../../../db/schema';
import CharacterFactory from '../../../factories/character-factory';
import getIdFromMention from '../../../utils/get-id-from-mention';
import Command from '../../base-command';

class AddRemoveCommand {
    async execute(
        message: Message,
        messageAsList: Array<string>,
        operator: '+' | '-',
        attribute: 'gold' | 'xp',
    ): Promise<void> {
        const playerId = getIdFromMention(messageAsList[0]);
        const quantity = parseInt(messageAsList[1]);

        const char = await CharacterFactory.getInstance().getFromPlayerId(playerId, message.guild!.id);

        if (eval(`${char[attribute]}${operator}${quantity}`) < 0) {
            await message.reply(`O personagem **${char.name}** nem possui essa quantidade de ${attribute}.`);
            return;
        }

        type UpdateObj = {
            [k: string]: number;
        };

        const updateObj: UpdateObj = {};
        updateObj[attribute] = eval(`${char[attribute]}${operator}${quantity}`);

        await db.update(character).set(updateObj).where(eq(character.id, char.id));

        await message.reply(
            `${quantity} de ${attribute} ${operator == '+' ? 'adicionado' : 'removido'} com sucesso ${operator == '+' ? 'para' : 'de'} **${char.name}**`,
        );
    }
}

export class RemoveExp extends AddRemoveCommand implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        super.execute(message, messageAsList, '-', 'xp');
    }
}

export class AddGold extends AddRemoveCommand implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        super.execute(message, messageAsList, '+', 'gold');
    }
}

export class RemoveGold extends AddRemoveCommand implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        super.execute(message, messageAsList, '-', 'gold');
    }
}
