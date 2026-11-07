import { Colors, EmbedBuilder } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../db/db';
import { Rule, rule } from '../db/schema';
import Factory from './base-factory';
import ShowEmbed from './show-embed';

class RuleFactory extends Factory<typeof rule> implements ShowEmbed<typeof rule> {
    constructor() {
        super(rule);
    }
    show(entry: Rule): EmbedBuilder {
        const objectiveEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle(`Regra ${entry.id} - ${entry.name}`)
            .setDescription(`${entry.description}`);

        return objectiveEmbed;
    }

    async getByName(ruleName: string, guildId: string): Promise<Rule> {
        return this.searchEntry(await this.getAll(guildId), 'name', ruleName);
    }

    async getAll(guildId: string): Promise<Array<Rule>> {
        return await db
            .select()
            .from(rule)
            .where(eq(rule.guildId, BigInt(guildId)));
    }

    async delete(id: number): Promise<void> {
        await db.delete(rule).where(eq(rule.id, id));
    }

    async getFromId(id: number): Promise<Rule> {
        const [entry] = await db.select().from(rule).where(eq(rule.id, id));
        return entry;
    }
}

export default new RuleFactory();
