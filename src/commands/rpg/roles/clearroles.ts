import { GuildMember, Message, Role } from 'discord.js';
import { Command } from '../../command';
import db from '../../../models/db';
import { role } from '../../../models/schema';

export default class ClearRoles implements Command {
    public async execute(message: Message): Promise<void> {
        const msgArray: Array<string> = message.content.split(' ');

        if (msgArray.length !== 2) {
            message.reply('Sintaxe do comando errada!');
            return;
        }

        const isMentionInTheRightPlace: boolean = msgArray[1].includes('@');

        if (!isMentionInTheRightPlace) {
            message.reply('Sintaxe do comando errada');
            return;
        }

        const player: GuildMember = message.member!;

        const guildRoles: Array<Role | null> = await this.fetchRoles(message);

        const memberRoles = player.roles.cache;

        for (const [_, role] of memberRoles) {
            if (guildRoles.includes(role)) {
                player.roles.remove(role);
            }
        }

        message.reply('Cargos removidos com sucesso!');
    }

    private async fetchRoles(message: Message): Promise<Array<Role | null>> {
        const roles = await db
            .select({
                roleId: role.discordId,
            })
            .from(role);

        const guildRoles: Array<Role | null> = await Promise.all(
            roles.map(async (role) => await message.guild!.roles.fetch(role.roleId.toString())),
        );
        return guildRoles;
    }
}
