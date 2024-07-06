import { ilike } from 'drizzle-orm';
import db from '../../models/db';
import { item } from '../../models/schema';
import Command from '../command';

class ItemNotFoundError extends Error {}

export default class UseItem extends Command {
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');

        const commandArgs: Array<string> = msgArray.slice(1);

        let quantityToUse: number;

        isNaN(parseInt(commandArgs[0]))
            ? (quantityToUse = this.getQuantityFromLastIndex(commandArgs))
            : (quantityToUse = this.getQuantityFromFirstIndex(commandArgs));

        const itemName = commandArgs.join(' ');

        try {
            const itemId: number = await this.getItemIdFromName(itemName);
        } catch (error: unknown) {
            if (error instanceof ItemNotFoundError) {
                this.message.reply(`Não existe um item com o nome **${itemName}**`);
                return;
            }
            this.message.reply(`Houve um erro ao procurar o item na base de dados: **${error}**`);
        }
    }
    private getQuantityFromLastIndex(cmdArray: Array<string>): number {
        const quantity: number = parseInt(cmdArray[cmdArray.length - 1]);
        cmdArray.splice(cmdArray.length - 1, 1);

        return quantity;
    }
    private getQuantityFromFirstIndex(cmdArray: Array<string>): number {
        const quantity: number = parseInt(cmdArray[0]);
        cmdArray.splice(0, 1);

        return quantity;
    }

    private async getItemIdFromName(itemName: string): Promise<number> {
        const items: Array<{ itemId: number }> = await db
            .select({
                itemId: item.id,
            })
            .from(item)
            .where(ilike(item.nome, `%${itemName}%`));

        if (items.length === 0) {
            throw new ItemNotFoundError(`Item with name ${itemName} does not exist`);
        }

        return items[0].itemId;
    }
}
