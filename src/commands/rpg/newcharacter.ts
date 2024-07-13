import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Message,
    PermissionsBitField,
} from 'discord.js';
import { getCharacterNameFromId, getIdFromMention } from '../../utils';
import Command from '../command';
import db from '../../models/db';
import { inventario, personagem } from '../../models/schema';
import { eq } from 'drizzle-orm';
import { hasPermission } from '../decorators';

export default class NewCharacter extends Command {
    @hasPermission(PermissionsBitField.Flags.Administrator)
    public async execute(): Promise<void> {
        const msgArray: Array<string> = this.message.content.split(' ');

        let id: string;
        let characterName: string;
        if (msgArray.length === 1) {
            id = this.message.author.id;
            characterName = await getCharacterNameFromId(id, this.message.guild!);
        } else if (msgArray.length === 2 && msgArray[1].includes('@')) {
            id = getIdFromMention(msgArray[1]);
            characterName = await getCharacterNameFromId(id, this.message.guild!);
        } else if (msgArray.length === 2) {
            id = this.message.author.id;
            characterName = msgArray[1];
        } else if (msgArray.length > 2 && msgArray[1].includes('@')) {
            id = getIdFromMention(msgArray[1]);
            characterName = msgArray.slice(2).join(' ');
        } else {
            id = this.message.author.id;
            characterName = msgArray.slice(1).join(' ');
        }

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm-character-switch')
            .setLabel('Confirmar')
            .setStyle(ButtonStyle.Danger);

        const buttonRow: ActionRowBuilder<ButtonBuilder> =
            new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton);

        const confirmationMsg: Message = await this.message.reply({
            content: 'Você tem certeza?',
            components: [buttonRow],
        });

        const confirmation = await confirmationMsg.awaitMessageComponent({
            filter: (i) => i.user.id === this.message.author.id,
            time: 60_000,
        });

        if (confirmation.customId === 'confirm-character-switch') {
            this.changeCharacter(id, characterName);
            await confirmationMsg.edit({
                content: 'Personagem alterado com sucesso!',
                components: [],
            });
            return;
        }
    }

    private async changeCharacter(playerId: string, newCharacterName: string): Promise<void> {
        const promises: Array<Promise<void>> = [];
        promises.push(this.deleteInventoryEntries(playerId));
        promises.push(this.inactivateCharacters(playerId));

        await Promise.all(promises);

        await this.createCharacter(playerId, newCharacterName);
    }

    private async deleteInventoryEntries(playerId: string): Promise<void> {
        const characters: Array<{ id: number }> = await db
            .select({ id: personagem.id })
            .from(personagem)
            .where(eq(personagem.jogador, BigInt(playerId)));

        const character = characters[0];

        await db.delete(inventario).where(eq(inventario.idPersonagem, character.id));
    }

    private async inactivateCharacters(playerId: string): Promise<void> {
        await db
            .update(personagem)
            .set({ ativo: false })
            .where(eq(personagem.jogador, BigInt(playerId)));
    }

    private async createCharacter(playerId: string, characterName: string): Promise<void> {
        await db.insert(personagem).values({
            nome: characterName,
            gold: 0,
            xp: 0,
            ativo: true,
            jogador: BigInt(playerId),
        });
    }
}
