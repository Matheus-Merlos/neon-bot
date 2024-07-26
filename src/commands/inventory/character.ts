import { and, count, eq, gt } from 'drizzle-orm';
import db from '../../models/db';
import { inventario, item, personagem } from '../../models/schema';
import { Element } from '../element';
import { detectLevelUp } from './ranks/levelup';
import { Message } from 'discord.js';
import { Rank } from './ranks/rank';

function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

function numberMethodUpdate(
    target: Character,
    methodName: string,
    descriptor: PropertyDescriptor,
): PropertyDescriptor {
    const originalMethod = descriptor.value;
    return {
        value: async function (...args: Array<unknown>) {
            const quantity = args[0];
            if (!isNumber(quantity)) {
                throw new Error('First argument should be a number');
            }

            if (quantity < 0) {
                throw new Error('Quantity should not be negative');
            }
            await originalMethod.apply(this, [quantity, ...args]);
            await (this as Character).update();
            return;
        },
    };
}

export type InventoryItem = {
    quantity: number;
    name: string;
    description: string;
};

export class Character implements Element {
    private id: number;
    private name: string;
    private exp: number;
    private gold: number;
    private active: boolean;
    private playerId: bigint;
    private rankId: number;

    private inventoryItems: Promise<Array<InventoryItem>>;

    constructor(
        id: number,
        name: string,
        exp: number,
        gold: number,
        active: boolean,
        playerId: bigint,
        rankId: number,
    ) {
        this.id = id;
        this.name = name;
        this.exp = exp;
        this.gold = gold;
        this.active = active;
        this.playerId = playerId;
        this.rankId = rankId;

        this.inventoryItems = this.getInventoryItems();
    }

    get characterName(): string {
        return this.name;
    }

    get money(): number {
        return this.gold;
    }

    get xp(): number {
        return this.exp;
    }

    get inventory(): Promise<Array<InventoryItem>> {
        return this.inventoryItems;
    }

    get currentRank(): number {
        return this.rankId;
    }

    @numberMethodUpdate
    @detectLevelUp
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async addExp(quantity: number, message: Message): Promise<void> {
        this.exp += quantity;
    }

    @numberMethodUpdate
    public async removeExp(quantity: number): Promise<void> {
        this.exp -= quantity;
    }

    @numberMethodUpdate
    public async addGold(quantity: number): Promise<void> {
        this.gold += quantity;
    }

    @numberMethodUpdate
    public async removeGold(quantity: number): Promise<void> {
        this.gold -= quantity;
    }

    public async inactivateCharacter(): Promise<void> {
        this.active = false;
        await this.update();
    }

    public playerMention(): string {
        return `<@${this.playerId}>`;
    }

    public async updateRank(rank: Rank): Promise<void> {
        this.rankId = rank.id;
        await this.update();
    }

    public async update(): Promise<void> {
        await db
            .update(personagem)
            .set({
                nome: this.name,
                xp: this.exp,
                gold: this.gold,
                ativo: this.active,
                rankId: this.rankId,
            })
            .where(eq(personagem.id, this.id));
    }

    private async getInventoryItems(): Promise<Array<InventoryItem>> {
        const result: Array<InventoryItem> = await db
            .select({
                quantity: count(item.nome),
                name: item.nome,
                description: item.descricao,
            })
            .from(inventario)
            .innerJoin(item, eq(inventario.idItem, item.id))
            .where(and(eq(inventario.idPersonagem, this.id), gt(inventario.durabilidadeAtual, 0)))
            .groupBy(item.nome, item.descricao);

        return result;
    }
}

type DatabaseCharacter = {
    id: number;
    characterName: string;
    exp: number;
    gold: number;
    active: boolean;
    playerId: bigint;
    rank: number;
};

export class CharacterFactory {
    public static async retrieveFromId(playerDiscordId: bigint): Promise<Character> {
        const characters: Array<DatabaseCharacter> = await db
            .select({
                id: personagem.id,
                characterName: personagem.nome,
                exp: personagem.xp,
                gold: personagem.gold,
                active: personagem.ativo,
                playerId: personagem.jogador,
                rank: personagem.rankId,
            })
            .from(personagem)
            .where(and(eq(personagem.jogador, playerDiscordId), eq(personagem.ativo, true)));

        if (!characters) {
            throw new Error('Player does not have an active character');
        }
        const character = characters[0];

        const { id, characterName, exp, gold, active, playerId, rank } = character;

        return new Character(id, characterName, exp, gold, active, playerId, rank);
    }

    public static async retireveAllCharacters(): Promise<Array<Character>> {
        const dbCharacters: Array<DatabaseCharacter> = await db
            .select({
                id: personagem.id,
                characterName: personagem.nome,
                exp: personagem.xp,
                gold: personagem.gold,
                active: personagem.ativo,
                playerId: personagem.jogador,
                rank: personagem.rankId,
            })
            .from(personagem)
            .where(eq(personagem.ativo, true));

        const characters: Array<Character> = dbCharacters.map((character: DatabaseCharacter) => {
            const { id, characterName, exp, gold, active, playerId, rank } = character;

            return new Character(id, characterName, exp, gold, active, playerId, rank);
        });

        return characters;
    }
}
