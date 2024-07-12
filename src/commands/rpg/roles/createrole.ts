import { Role } from 'discord.js';
import Command from '../../command';
import db from '../../../models/db';
import { role } from '../../../models/schema';
import { hasPermission } from '../../decorators';

export default class CreateRole extends Command {
    @hasPermission
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');

        if (msgArray.length !== 2) {
            this.message.reply('Sintaxe do comando errada!');
            return;
        }

        const roleId: string = this.getRoleIdFromMention(msgArray[1]);

        const role: Role | null = await this.message.guild!.roles.fetch(roleId);
        const roleName = this.removeEmojis(role!.name).toLowerCase().replaceAll(' ', '-');

        try {
            await this.addRole(roleId, roleName);
        } catch (error) {
            this.message.reply('Um cargo com esse nome já existe, operação abortada');
            return;
        }
        this.message.reply('Cargo criado com sucesso!');
    }

    private getRoleIdFromMention(roleMention: string): string {
        return roleMention.slice(3, roleMention.length - 1);
    }
    private removeEmojis(str: string): string {
        const regexEmojis =
            /[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEFF]/g;

        return str.replace(regexEmojis, '');
    }

    private async addRole(roleId: string, roleName: string): Promise<void> {
        await db.insert(role).values({ discordId: BigInt(roleId), nome: roleName });
    }
}
