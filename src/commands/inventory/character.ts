import { and, eq } from 'drizzle-orm';
import db from '../../models/db';
import { personagem } from '../../models/schema';
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

export class Character implements Element {
    private id: number;
    private name: string;
    private exp: number;
    private gold: number;
    private active: boolean;
    private playerId: bigint;

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
}

export class CharacterFactory {
    public static async retrieveFromId(playerId: bigint): Promise<Character> {
        const characters = await db
            .select({
                id: personagem.id,
                characterName: personagem.nome,
                exp: personagem.xp,
                gold: personagem.gold,
                active: personagem.ativo,
                playerId: personagem.jogador,
            })
            .from(personagem)
            .where(and(eq(personagem.jogador, playerId), eq(personagem.ativo, true)));

        if (!characters) {
            throw new Error('Player does not have an active character');
        }

        const character = characters[0];

        return new Character(
            character.id,
            character.characterName,
            character.exp,
            character.gold,
            character.active,
            character.playerId,
        );
    }
}
