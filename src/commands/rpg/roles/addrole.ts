import { GuildMember, Role } from 'discord.js';
import { getIdFromMention } from '../../../utils';
import Command from '../../command';
import db from '../../../models/db';
import { role } from '../../../models/schema';
import { ilike } from 'drizzle-orm';

type DbRole = {
    roleId: bigint;
};

export default class AddRole extends Command {
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');

        const isMentionInTheRightPlace: boolean = msgArray[1].includes('@');

        if (!isMentionInTheRightPlace) {
            this.message.reply('Sintaxe do comando errada');
            return;
        }

        const playerId: string = getIdFromMention(msgArray[1]);
        msgArray.splice(0, 2);

        const rolesToAdd: Array<Role> = await Promise.all(
            msgArray.map(async (roleName: string) => await this.getRoleIdFromName(roleName)),
        );

        const member: GuildMember | undefined = await this.message.guild?.members.fetch(playerId);

        rolesToAdd.forEach((role: Role) => {
            member!.roles.add(role);
        });

        this.message.reply('Cargos adicionados com sucesso!');
    }
    private async getRoleIdFromName(roleName: string): Promise<Role> {
        const rolesId: Array<DbRole> = await db
            .select({
                roleId: role.discordId,
            })
            .from(role)
            .where(ilike(role.nome, `%${roleName}%`));

        if (rolesId.length === 0) {
            throw new Error('Não existe um cargo com esse nome');
        }
        const roleId = rolesId[0].roleId.toString();

        const guildRole: Role | null | undefined = await this.message.guild?.roles.fetch(roleId);
        if (guildRole === null || guildRole === undefined) {
            throw new Error('Não existe um cargo com esse nome');
        }
        return guildRole;
    }
}
