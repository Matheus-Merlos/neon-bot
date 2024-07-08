import { GuildMember, Role } from 'discord.js';
import Command from '../../command';
import db from '../../../models/db';
import { role } from '../../../models/schema';

export default class ClearRoles extends Command {
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');

        if (msgArray.length !== 2) {
            this.message.reply('Sintaxe do comando errada!');
            return;
        }

        const isMentionInTheRightPlace: boolean = msgArray[1].includes('@');

        if (!isMentionInTheRightPlace) {
            this.message.reply('Sintaxe do comando errada');
            return;
        }

        const player: GuildMember = this.message.member!;

        const guildRoles: Array<Role | null> = await this.fetchRoles();

        const memberRoles = player.roles.cache;

        for (const [_, role] of memberRoles) {
            if (guildRoles.includes(role)) {
                player.roles.remove(role);
            }
        }

        this.message.reply('Cargos removidos com sucesso!');
    }

    private async fetchRoles(): Promise<Array<Role | null>> {
        const roles = await db
            .select({
                roleId: role.discordId,
            })
            .from(role);

        const guildRoles: Array<Role | null> = await Promise.all(
            roles.map(
                async (role) => await this.message.guild!.roles.fetch(role.roleId.toString()),
            ),
        );
        return guildRoles;
    }
}
