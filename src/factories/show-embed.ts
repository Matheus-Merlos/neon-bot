import { EmbedBuilder } from 'discord.js';
import { InferSelectModel, Table } from 'drizzle-orm';

export default interface ShowEmbed<T extends Table> {
    show(entry: InferSelectModel<T>): EmbedBuilder;
}
