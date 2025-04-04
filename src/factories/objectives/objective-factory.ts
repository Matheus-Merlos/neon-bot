import { Colors, EmbedBuilder } from 'discord.js';
import { asc, eq } from 'drizzle-orm';
import db from '../../db/db';
import { objective } from '../../db/schema';
import Factory from '../base-factory';
import ShowEmbed from '../show-embed';

class ObjectiveFactory extends Factory<typeof objective> implements ShowEmbed<typeof objective> {
    constructor() {
        super(objective);
    }
    show(entry: {
        id: number;
        name: string;
        xp: number;
        gold: number;
        description: string;
        type: number;
        guildId: bigint;
    }): EmbedBuilder {
        const objectiveEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle(entry.name)
            .setDescription(`${entry.description}\n**Recompensas:**`)
            .setFields(
                {
                    name: 'XP',
                    value: `${entry.xp}`,
                    inline: true,
                },
                {
                    name: 'Dinheiro',
                    value: `$${entry.gold}`,
                    inline: true,
                },
            );

        return objectiveEmbed;
    }

    async getByName(
        objectiveName: string,
        guildId: string,
    ): Promise<{ id: number; name: string; xp: number; gold: number; type: number; description: string; guildId: bigint }> {
        return await this.searchEntry(await this.getAll(guildId), 'name', objectiveName);
    }

    async getAll(
        guildId: string,
    ): Promise<{ id: number; name: string; xp: number; gold: number; type: number; description: string; guildId: bigint }[]> {
        return await db
            .select()
            .from(objective)
            .orderBy(asc(objective.xp))
            .where(eq(objective.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        await db.delete(objective).where(eq(objective.id, id));
    }
}

export default new ObjectiveFactory();
