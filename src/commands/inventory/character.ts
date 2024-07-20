import { and, count, eq, gt } from 'drizzle-orm';
import db from '../../models/db';
import { inventario, item, personagem } from '../../models/schema';
import { Element } from '../element';

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

    private inventoryItems: Promise<Array<InventoryItem>>;

    constructor(
        id: number,
        name: string,
        exp: number,
        gold: number,
        active: boolean,
        playerId: bigint,
    ) {
        this.id = id;
        this.name = name;
        this.exp = exp;
        this.gold = gold;
        this.active = active;
        this.playerId = playerId;

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

    @numberMethodUpdate
    public async addExp(quantity: number): Promise<void> {
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

    public async update(): Promise<void> {
        await db
            .update(personagem)
            .set({
                nome: this.name,
                xp: this.exp,
                gold: this.gold,
                ativo: this.active,
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
            })
            .from(personagem)
            .where(and(eq(personagem.jogador, playerDiscordId), eq(personagem.ativo, true)));

        if (!characters) {
            throw new Error('Player does not have an active character');
        }
        const character = characters[0];

        const { id, characterName, exp, gold, active, playerId } = character;

        return new Character(id, characterName, exp, gold, active, playerId);
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
            })
            .from(personagem)
            .where(eq(personagem.ativo, true));

        const characters: Array<Character> = dbCharacters.map((character: DatabaseCharacter) => {
            const { id, characterName, exp, gold, active, playerId } = character;

            return new Character(id, characterName, exp, gold, active, playerId);
        });

        return characters;
    }
}
